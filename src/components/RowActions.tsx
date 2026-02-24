import React, { useState } from 'react'
import { useDeleteApplication } from "../hooks/useDelApplication"
import { createPortal } from 'react-dom'

interface RowActionsProps {
  index: number
  applicationId: number
}

const RowActions = ({ index, applicationId }: RowActionsProps) => {
  const { deleteWithConfirmation } = useDeleteApplication()
  const [open, setOpen] = useState(false)

  return (
    <div className='relative group w-12'>
      <button
        onClick={(e) => {
          e.stopPropagation()
          console.log('click');
          setOpen((prev) => !prev)
        }}
        type="button"
        className="absolute right-0 top-1/2 -translate-y-1/2 border aspect-square w-4 cursor-pointer select-none hidden group-hover:inline-flex hover:inline-flex"
      >
        ...
      </button>
      {/* <button
        onClick={(e) => {
          e.stopPropagation()
          deleteWithConfirmation(String(applicationId))
        }}
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 cursor-pointer select-none hidden group-hover:inline-flex hover:inline-flex"
      >
        Delete
      </button> */}

      {index}
      {open && createPortal(
        <div className="absolute right-0  max-h-56 overflow-auto rounded border border-gray-200 bg-white shadow z-10">
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteWithConfirmation(applicationId)
            }}
            type="button"
            className="text-red-500 cursor-pointer select-none"
          >
            Delete
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}

export default RowActions