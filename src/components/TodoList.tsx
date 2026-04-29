import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./TodoList.css";
import {
    archiveDay,
    getDateStamp,
    loadPlannerState,
    savePlannerState,
    type ArchivedDay,
    type DailyReview,
    type Todo,
} from "../todoStorage";

const INITIAL_TODOS: Todo[] = [];

export function TodoList() {
    const todayStamp = getDateStamp();

    const [todos, setTodos] = useState<Todo[]>([]);
    const [archives, setArchives] = useState<ArchivedDay[]>([]);
    const [dailyReview, setDailyReview] = useState<DailyReview | null>(null);
    const [reasons, setReasons] = useState<Record<number, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    const [inputValue, setInputValue] = useState("");
    const [adding, setAdding] = useState(false);
    const [draggedId, setDraggedId] = useState<number | null>(null);
    const [dragOverId, setDragOverId] = useState<number | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const suppressClickRef = useRef(false);

    useEffect(() => {
        const loaded = loadPlannerState(todayStamp, INITIAL_TODOS);
        setTodos(loaded.activeTodos);
        setArchives(loaded.archives);
        setDailyReview(loaded.review);

        // Сохраняем только если нет ревью (новый день без вчерашних задач,
        // или вообще нет данных в LS)
        if (!loaded.review) {
            savePlannerState(todayStamp, loaded.activeTodos, loaded.archives);
        }

        setIsLoaded(true);
    }, [todayStamp]);

    useEffect(() => {
        if (adding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [adding]);

    useEffect(() => {
        if (dailyReview || !isLoaded) return;
        savePlannerState(todayStamp, todos, archives);
    }, [todos, archives, dailyReview, todayStamp, isLoaded]);

    const toggle = (id: number) => {
        setTodos((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, checked: !task.checked } : task,
            ),
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

        inputRef.current?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") addTodo();
        if (event.key === "Escape") {
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

    const saveYesterdayToArchive = () => {
        if (!dailyReview) return;
        const archived = archiveDay(dailyReview, reasons);
        setArchives((prev) => [...prev, archived]);
        setDailyReview(null);
        setReasons({});
    };

    if (dailyReview) {
        const yesterdayLabel = new Date(dailyReview.date).toLocaleDateString(
            "ru-RU",
            {
                day: "numeric",
                month: "long",
                weekday: "long",
            },
        );

        return (
            <>
                <p
                    className="date"
                    style={{ textAlign: "center", marginBottom: "0.8rem" }}
                >
                    Задачи за {yesterdayLabel}
                </p>
                <ul className="todo-list">
                    {dailyReview.todos.map((todo, index) => (
                        <li
                            key={todo.id}
                            className={`todo-item${todo.checked ? " todo-checked" : ""}`}
                            style={{ animationDelay: `${index * 0.07}s` }}
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

                            <div style={{ width: "100%" }}>
                                <span className="todo-text">{todo.text}</span>
                                <textarea
                                    className="todo-input"
                                    value={reasons[todo.id] || ""}
                                    onChange={(event) => {
                                        setReasons((prev) => ({
                                            ...prev,
                                            [todo.id]: event.target.value,
                                        }));
                                        // авторазмер
                                        event.target.style.height = "auto";
                                        event.target.style.height =
                                            String(event.target.scrollHeight) +
                                            "px";
                                    }}
                                    placeholder={
                                        todo.checked
                                            ? "Комментарий к задаче"
                                            : "Причина невыполнения"
                                    }
                                    rows={1}
                                    style={{
                                        resize: "none",
                                        overflow: "hidden",
                                    }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
                <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <button
                        type="button"
                        onClick={saveYesterdayToArchive}
                        style={{
                            border: "none",
                            borderRadius: "10px",
                            padding: "0.55rem 1rem",
                            fontFamily: "Nunito, sans-serif",
                            cursor: "pointer",
                            background: "rgba(232, 168, 124, 0.2)",
                            color: "#6b3a2a",
                            fontWeight: 600,
                        }}
                    >
                        Сохранить
                    </button>
                </div>
            </>
        );
    }

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
                            { "--todo-size": getFontSize(i) } as CSSProperties
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
                        onChange={(event) => {
                            setInputValue(event.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            addTodo();
                            setAdding(false);
                        }}
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
