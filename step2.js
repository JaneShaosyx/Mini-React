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
    // create dom for element
    const dom = element.type == "TEXXT_ELEMENT" ? document.createTextNode("") : document.createElement(element.type);
    // recursively create dom for each child
    element.props.children.map(render(child, dom));
    // assign props for dom of element
    const isProperty = key => key !== "children";
    Object.keys(element.props).filter(isProperty).forEach(name => {
        dom[name] = element.props[name];
    });
    // append to the container
    container.appendChild(dom);
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
// re-write render function
Didact.render(element, container);