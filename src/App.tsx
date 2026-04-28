import "./App.css";
import { TodoList } from "./components/todoList";

function App() {
    const today = new Date().toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        weekday: "long",
    });

    return (
        <div className="page">
            <div className="decorations" aria-hidden="true">
                <span className="deco deco1">✦</span>
                <span className="deco deco2">★</span>
                <span className="deco deco3">✦</span>
                <span className="deco deco4">☆</span>
                <span className="deco deco5">✦</span>
                <span className="deco deco6">★</span>
                <span className="deco deco7">☆</span>
                <span className="deco deco8">✦</span>
                <span className="ghost">☆</span>
                <span className="shell">✦</span>
                <span className="star-outline">✩</span>
            </div>

            <div className="card-header">
                <h1 className="title">Todo list</h1>
                <p className="date">{today}</p>
            </div>
            <TodoList />
        </div>
    );
}

export default App;
