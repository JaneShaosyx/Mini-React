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

function commitRoot() {
    commitWork(wipRoot.child);
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) return;
    const domParent = fiber.parent.dom;
    domParent.appendChild(fiber.dom);
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
    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
// keep track of the root of the fiber tree
let wipRoot = null;

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    if (!nextUnitOfWork && wipRoot) {
        // once we finish all the work (we know it because there isn’t a next unit of work) we commit the whole fiber tree to the DOM.
        commitRoot();
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(fiber);

// to prevent user sees the incomplete UI, we need to remove the DOM manipulation before rendering the whole tree
function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    const elements = fiber.children;
    let index = 0;
    let prevSibling = null;

    while (index < element.length) {
        const element = element[index];
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null
        };

        if (index === 0) {
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }
        prevSibling = newFiber;
        index++;
    }
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

