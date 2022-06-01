import create, { State, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { generateId } from "./../../../files_for_todo_list/helper";

interface Task {
  id: string;
  title: string;
  createdAt: number;
}

interface ToDoStore {
  tasks: Task[];
  createTask: (title: string) => void;
  updateTask: (id: string, title: string) => void;
  removeTask: (id: string) => void;
}

function isTodoStore(object: any): object is ToDoStore {
  return "tasks" in object;
}

const localStoreUpdate =
  <T extends State>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (nexState, ...args) => {
        if (isTodoStore(nexState)) {
          window.localStorage.setItem("tasks", JSON.stringify(nexState.tasks));
          set(nexState, ...args);
        }
      },
      get,
      api
    );
const getCurrentState = () => {
  try {
    const currentState = JSON.parse(
      window.localStorage.getItem("tasks") || "[]"
    ) as Task[];
    return currentState;
  } catch (err) {
    window.localStorage.setItem("tasks", "[]");
  }
  return [];
};

export const useToDoStore = create<ToDoStore>(
  localStoreUpdate(
    devtools((set, get) => ({
      tasks: getCurrentState(),
      createTask: (title) => {
        const { tasks } = get();
        const newTask = {
          id: generateId(),
          title,
          createdAt: Date.now(),
        };

        set({
          tasks: [newTask].concat(tasks),
        });
      },

      updateTask: (id: string, title: string) => {
        const { tasks } = get();
        set({
          tasks: tasks.map((task) => ({
            ...task,
            title: task.id === id ? title : task.title,
          })),
        });
      },
      removeTask: (id: string) => {
        const { tasks } = get();
        set({
          tasks: tasks.filter((task) => task.id !== id),
        });
      },
    }))
  )
);
