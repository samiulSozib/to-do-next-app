
export const GET_TODOS_BY_USER_ID = `
query GetTodosByUserId($user_id: uuid!, $limit: Int, $offset: Int, $order_by: order_by!) {
  todos(where: { user_id: { _eq: $user_id } }, limit: $limit, offset: $offset, order_by: { created_at: $order_by }) {
    id
    user_id
    title
    description
    completed
    created_at
    updated_at
    category
  }
}
`;

export const INSERT_TODO = `
mutation InsertTodo($user_id: uuid, $title: String, $description: String, $completed: Boolean, $category: String) {
  insert_todos(objects: { user_id: $user_id, title: $title, description: $description, completed: $completed, category: $category }) {
    affected_rows
  }
}
`;

export const UPDATE_TODO = `
mutation UpdateTodo($id: uuid!, $title: String!, $description: String!, $category: String!, $completed: Boolean!) {
  update_todos(where: {id: {_eq: $id}}, _set: {title: $title, description: $description, category: $category, completed: $completed}) {
    affected_rows
  }
}
`;

export const DELETE_TODO = `
mutation DeleteTodo($id: uuid!) {
  delete_todos(where: {id: {_eq: $id}}) {
    affected_rows
  }
}
`;

export const INSERT_TRASH = `
mutation InsertTodo($user_id: uuid, $title: String, $description: String, $completed: Boolean,$created_at:timestamptz,$updated_at:timestamptz, $category: String) {
  insert_trash(objects: { user_id: $user_id, title: $title, description: $description, completed: $completed,created_at:$created_at,updated_at:$updated_at, category: $category }) {
    affected_rows
  }
}
`;

export const MOVE_TO_TRASH = `
  mutation moveToTrashFromTodo($todo_id: uuid!) {
    todo_to_trash(args: { todo_id: $todo_id }) {
      id
      title
      description
      category
      completed
    }
  }
`;




export const UPDATE_TODO_COMPLETED = `
mutation UpdateTodoCompleted($id: uuid!, $completed: Boolean!) {
  update_todos(where: {id: {_eq: $id}}, _set: {completed: $completed}) {
    affected_rows
  }
}
`;



export const GET_TRASHS_BY_USER_ID = `
    query GetTrashsByUserId($user_id: uuid!) {
    trash(where: {user_id: {_eq: $user_id}}) {
    user_id
    updated_at
    title
    id
    description
    deleted_at
    created_at
    completed
    category
  }
}
`;

export const DELETE_TRASH = `
mutation DeleteTrash($id: uuid!) {
  delete_trash(where: {id: {_eq: $id}}) {
    affected_rows
  }
}
`;


export const DELETE_ALL_TRASH = `
mutation DeleteAllTrash($user_id: uuid!) {
  delete_trash(where: {user_id: {_eq: $user_id}}) {
    affected_rows
  }
}
`;