
import { useDeleteApplication } from "../hooks/useDelApplication"
import { usePopover } from "../hooks/usePopover"
import Portal from './Portal'

interface RowActionsProps {
  index: number
  applicationId: number
}

const RowActions = ({ index, applicationId }: RowActionsProps) => {
  const { deleteWithConfirmation } = useDeleteApplication()
  const { isOpen, toggle, close, setReference, setFloating, floatingStyles } = usePopover({ placement: "bottom-end" })

  return (
    <div className='relative group w-12'>
      {/* Trigger - o ref do setReference liga este botão ao Floating UI para ele saber a posição de referência */}
      <button
        ref={setReference}
        onClick={(e) => {
          e.stopPropagation()
          toggle()
        }}
        type="button"
        className={`absolute right-0 top-1/2 -translate-y-1/2 
                    border aspect-square w-4 cursor-pointer select-none 
                    ${isOpen ? "inline-flex" : "hidden group-hover:inline-flex"}`}
      >
        ...
      </button>
      {index}
      {isOpen && (
        <Portal>
          <div
            ref={setFloating}
            style={floatingStyles}
            className='rounded border border-gray-200 bg-white shadow-lg z-50'
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteWithConfirmation(applicationId)
                close()
              }}
              type="button"
              className="px-3 py-2 text-red-500 hover:bg-gray-100 
                         cursor-pointer w-full text-left"
            >
              Delete
            </button>
          </div>
        </Portal>
      )}
    </div>
  )
}

export default RowActions