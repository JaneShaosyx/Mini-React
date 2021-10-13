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

function render(element, container) {
    const dom = element.type == "TEXXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type);
    element.props.children.map(render(child, dom));
    const isProperty = key => key !== "children";
    Object.keys(element.props).filter(isProperty).forEach(name => {
        dom[name] = element.props[name];
    });
    container.appendChild(dom);
}

// When the rendering tree is too big, we need to divide the whole rendering task into small pieces in order not to block the main thread
let nextUnitOfWork = null;

function workLoop(deadline) {
    let shouldYield = false;
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(nextUnitOfWork) {
    // TODO
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

