import { useState, useRef, useEffect, type CSSProperties } from "react";
import "./TodoList.css";

interface Task {
    id: number;
    text: string;
    checked: boolean;
    comment?: string;
}

interface ArchiveDay {
    date: string;
    archivedAt: string;
    tasks: Task[];
}

interface PlannerStorage {
    TasksByDate: Record<string, Task[]>;
    archivedDays: ArchiveDay[];
    reviewedDates: string[];
}

const STORAGE_KEY = "Task-planner-v1";

export function TodoList() {
    const [todos, setTodos] = useState<Task[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [adding, setAdding] = useState(false);
    const [draggedId, setDraggedId] = useState<number | null>(null);
    const [dragOverId, setDragOverId] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const suppressClickRef = useRef(false);

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

    const moveTodo = (fromId: number, toId: number) => {
        if (fromId === toId) return;
        setTodos((prev) => {
            const fromIndex = prev.findIndex((todo) => todo.id === fromId);
            const toIndex = prev.findIndex((todo) => todo.id === toId);
            if (fromIndex < 0 || toIndex < 0) return prev;
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const getFontSize = (index: number) => {
        const maxSize = 1.7;
        const minSize = 1.05;
        const step = 0.1;
        return `${Math.max(minSize, maxSize - index * step)}rem`;
    };

    return (
        <ul className="todo-list">
            {todos.map((todo, i) => (
                <li
                    key={todo.id}
                    className={`todo-item${todo.checked ? " todo-checked" : ""}`}
                    style={{ animationDelay: `${i * 0.07}s` }}
                    draggable
                    onDragStart={(event) => {
                        setDraggedId(todo.id);
                        setDragOverId(todo.id);
                        event.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnter={() => {
                        if (draggedId !== null && draggedId !== todo.id) {
                            setDragOverId(todo.id);
                        }
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                    }}
                    onDrop={(event) => {
                        event.preventDefault();
                        if (draggedId !== null && dragOverId !== null) {
                            moveTodo(draggedId, dragOverId);
                            suppressClickRef.current = true;
                        }
                        setDraggedId(null);
                        setDragOverId(null);
                    }}
                    onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverId(null);
                    }}
                    onClick={() => {
                        if (suppressClickRef.current) {
                            suppressClickRef.current = false;
                            return;
                        }
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
                    <span
                        className="todo-text"
                        style={
                            {
                                "--todo-size": getFontSize(i),
                            } as CSSProperties
                        }
                    >
                        {todo.text}
                    </span>
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
    );
}
