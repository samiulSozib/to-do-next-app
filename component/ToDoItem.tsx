import React from 'react';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  category: string;
};

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onDelete: () => void; // For Delete Functionality
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <tr key={todo.id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) => onToggle(todo.id, e.target.checked)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{todo.title}</td>
      <td className="px-6 py-4 whitespace-nowrap">{todo.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          className="text-red-600 hover:text-red-900"
          onClick={onDelete} // Call Delete
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default TodoItem;
