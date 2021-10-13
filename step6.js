function createElement(type, props, ...children) {
    return {
        type: type,
        props: {
            ...props,
            children: children.map(child => typeof child === "object" ? child : createTextElement(child))
        }
    };
}

function createTextElement(text) {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: []
        }
    };
}

function createDom(fiber) {
    const dom = fiber.type == "TEXXT_ELEMENT" ? document.createTextNode("") : document.createElement(fiber.type);
    const isProperty = key => key !== "children";
    Object.keys(fiber.props).filter(isProperty).forEach(name => {
        dom[name] = fiber.props[name];
    });
    return dom;
}

const isEvent = key => key.startWith("on");
const isProperty = key => key !== "children" && isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);
function updateDom(dom, prevProps, nextProps) {
    // remove old or changed event listener
    Object.keys(prevProps).filter(isEvent).filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key)).forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, prevProps[name]);
    });

    // remove old props
    Object.keys(prevProps).filter(isProperty).filter(isGone(prevProps, nextProps)).forEach(name => { dom[name] = ""; });
    // set new or changed props
    Object.keys(nextProps).filter(isProperty).filter(isNew(prevProps, nextProps)).forEach(name => { dom[name] = nextProps[name]; });
    // Add event Listeners
    Object.keys(nextProps).filter(isEvent).filter(isNew(prevProps, nextProps)).forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) return;
    const domParent = fiber.parent.dom;
    // add new node to render tree
    if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === "DELETION") {
        domParent.removeChild(fiber.dom);
    } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        }
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let currentRoot = null;
let wipRoot = null;
let deletions = null;

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(fiber);

function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    const elements = fiber.children;
    reconcileChildren(fiber, elements);

    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        } else {
            nextFiber = nextFiber.parent;
        }
    }
}

function reconcileChildren(wipFiber, elements) {
    let index = 0;
    // We also add the alternate property to every fiber. This property is a link to the old fiber, the fiber that we committed to the DOM in the previous commit phase.
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;  // if alternate exist then child
    let prevSibling = null;

    while (index < elements.length || oldFiber != null) {
        const element = elements[index];
        const newFiber = null;
        // compare oldFiber to element
        // To compare them we use the type:
        // if the old fiber and the new element have the same type, we can keep the DOM node and just update it with the new props
        // if the type is different and there is a new element, it means we need to create a new DOM node
        // and if the types are different and there is an old fiber, we need to remove the old node
        const sameType = oldFiber && element && element.type === oldFiber.type;

        if (sameType) {
            // update the node
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                parent: wipFiber,
                dom: oldFiber.dom,
                alternate: oldFiber,
                effectTag: "UPDATE"
            };
        }
        if (element && !sameType) {
            // add this node
            newFiber = {
                type: element.type,
                props: element.props,
                parent: wipFiber,
                dom: null,
                alternate: null,
                effectTag: "PLACEMENT"
            };
        }
        if (oldFiber && !sameType) {
            // delete the oldFiber's node
            oldFiber.effectTag = "DELETION";
            deletions.push(oldFiber);
        }

        if (index === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
}

const Didact = { createElement, render };

const element = Didact.createElement(
    "div",
    { id: "foo" },
    Didact.createElement("a", null, "bar"),
    Didact.createElement("b")
);

/** @jsx Didact.createElement */
const element = (
    <div id="foo">
        <a>bar</a>
        <b />
    </div>
);

const container = document.getElementById("root");
Didact.render(element, container);

