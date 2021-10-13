// Step 0
// re-write JSX to vanilla JavaScript
// const element = <h1 title="foo">Hello</h1>
// const container = document.getElementById("root")
// ReactDOM.render(element, container)

const element = {
    type: "h1",
    props: {
        title: "foo",
        children: "Hello"
    }
};

const container = document.getElementById("root");

const node = document.createElement(element.type);
node["title"] = element.props.title;

const text = document.createElement("");
text["nodeValue"] = element.props.children;

node.appendChild(text);
container.appendChild(text);


