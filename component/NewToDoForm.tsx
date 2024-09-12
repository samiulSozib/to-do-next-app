'use client'

import { useRef } from 'react'

const NewTodoForm = () => {
  const formRef = useRef<HTMLFormElement>(null)

  async function action(data: FormData) {
    const title = data.get('title')
    if (typeof title !== 'string' || !title) return

    
    formRef.current?.reset()
  }

  return (
    <div>
        <form className='flex flex-col items-start' ref={formRef} action={action}>
        <h2 className='mb-2 font-medium'>Create a New Todo</h2>
        <input
            type='text'
            name='title'
            className='rounded border border-slate-400 px-2 py-0.5'
        />
        <button
            type='submit'
            className='ml-2 rounded bg-slate-700 px-2 py-1 text-sm text-black disabled:bg-opacity-50'
        >
            Add Todo
      </button>
    </form>
    </div>
  )
}

export default NewTodoForm