import { useState, useRef, useEffect } from "react";
import "./App.css";

interface Todo {
    id: number;
    text: string;
    checked: boolean;
}

const initialTodos: Todo[] = [
    { id: 1, text: "Tanke i you Lchit choul life.", checked: true },
    { id: 2, text: "Geswerla, Suninpu susparltrur.", checked: true },
    { id: 3, text: "Cake my blimenoer, agogle.", checked: true },
    { id: 4, text: "Bireme & mild. cotte paving.", checked: false },
    { id: 5, text: "Coineea & winit ilbrornitay.", checked: false },
];

function App() {
    const [todos, setTodos] = useState<Todo[]>(initialTodos);
    const [inputValue, setInputValue] = useState("");
    const [adding, setAdding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (adding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [adding]);

    const toggle = (id: number) => {
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)),
        );
    };

    const addTodo = () => {
        const text = inputValue.trim();
        if (!text) {
            setAdding(false);
            return;
        }
        setTodos((prev) => [...prev, { id: Date.now(), text, checked: false }]);
        setInputValue("");
        setAdding(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") addTodo();
        if (e.key === "Escape") {
            setAdding(false);
            setInputValue("");
        }
    };

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

            <ul className="todo-list">
                {todos.map((todo, i) => (
                    <li
                        key={todo.id}
                        className={`todo-item${todo.checked ? " todo-checked" : ""}`}
                        style={{ animationDelay: `${i * 0.07}s` }}
                        onClick={() => {
                            toggle(todo.id);
                        }}
                    >
                        <span className="checkbox-wrap">
                            <span
                                className={`checkbox${todo.checked ? " checked" : ""}`}
                            >
                                {todo.checked && (
                                    <svg viewBox="0 0 16 16" fill="none">
                                        <polyline
                                            points="3,8 7,12 13,4"
                                            stroke="white"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </span>
                        </span>
                        <span className="todo-text">{todo.text}</span>
                    </li>
                ))}

                {adding && (
                    <li className="todo-item todo-adding">
                        <span className="checkbox-wrap">
                            <span className="checkbox" />
                        </span>
                        <input
                            ref={inputRef}
                            className="todo-input"
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                            }}
                            onKeyDown={handleKeyDown}
                            onBlur={addTodo}
                            placeholder="Новая задача..."
                        />
                    </li>
                )}

                {!adding && (
                    <li
                        className="todo-item todo-empty"
                        onClick={() => {
                            setAdding(true);
                        }}
                    >
                        <span className="checkbox-wrap">
                            <span className="checkbox checkbox-empty" />
                        </span>
                        <span className="todo-placeholder">
                            — — — — — — — — — — —
                        </span>
                    </li>
                )}
            </ul>
        </div>
    );
}

export default App;
