export interface Todo {
    id: number;
    text: string;
    checked: boolean;
}

export interface ArchivedTodo extends Todo {
    reason?: string;
}

export interface ArchivedDay {
    date: string;
    archivedAt: string;
    todos: ArchivedTodo[];
}

interface StoredState {
    currentDate: string;
    activeTodos: Todo[];
    archives: ArchivedDay[];
}

export interface DailyReview {
    date: string;
    todos: Todo[];
}

export interface LoadedPlannerState {
    activeTodos: Todo[];
    archives: ArchivedDay[];
    review: DailyReview | null;
}

const STORAGE_KEY = "planner_todo_state_v1";

const isTodo = (value: unknown): value is Todo => {
    if (!value || typeof value !== "object") return false;
    const maybeTodo = value as Partial<Todo>;
    return (
        typeof maybeTodo.id === "number" &&
        typeof maybeTodo.text === "string" &&
        typeof maybeTodo.checked === "boolean"
    );
};

const normalizeTodos = (value: unknown): Todo[] => {
    if (!Array.isArray(value)) return [];
    return value.filter(isTodo);
};

const safeParse = (value: string | null): StoredState | null => {
    if (!value) return null;
    try {
        const parsed = JSON.parse(value) as Partial<StoredState>;
        if (
            !parsed ||
            typeof parsed !== "object" ||
            typeof parsed.currentDate !== "string"
        ) {
            return null;
        }
        return {
            currentDate: parsed.currentDate,
            activeTodos: normalizeTodos(parsed.activeTodos),
            archives: Array.isArray(parsed.archives) ? parsed.archives : [],
        };
    } catch {
        return null;
    }
};

export const getDateStamp = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const loadPlannerState = (
    today: string,
    fallbackTodos: Todo[],
): LoadedPlannerState => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const stored = safeParse(raw);

    if (!stored) {
        return { activeTodos: fallbackTodos, archives: [], review: null };
    }

    if (stored.currentDate === today) {
        return {
            activeTodos: stored.activeTodos,
            archives: stored.archives,
            review: null,
        };
    }

    return {
        activeTodos: [],
        archives: stored.archives,
        review: {
            date: stored.currentDate,
            todos: stored.activeTodos,
        },
    };
};

export const savePlannerState = (
    currentDate: string,
    activeTodos: Todo[],
    archives: ArchivedDay[],
) => {
    const state: StoredState = {
        currentDate,
        activeTodos,
        archives,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const archiveDay = (
    review: DailyReview,
    reasonsById: Record<number, string>,
): ArchivedDay => {
    return {
        date: review.date,
        archivedAt: new Date().toISOString(),
        todos: review.todos.map((todo) => ({
            ...todo,
            reason: todo.checked
                ? undefined
                : reasonsById[todo.id]?.trim() || "",
        })),
    };
};

// localStorage.setItem("planner_todo_state_v1", JSON.stringify({
//     currentDate: "2026-04-28",
//     activeTodos: [
//         { id: 1, text: "Сделать зарядку", checked: true },
//         { id: 2, text: "Прочитать 20 страниц", checked: false },
//         { id: 3, text: "Написать отчёт", checked: false }
//     ],
//     archives: []
// }));
