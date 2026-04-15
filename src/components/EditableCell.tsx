import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { apiClient } from "../api/client"
import { useDebouncedValue } from "../hooks/useDebouncedValue"
import { usePopover } from "../hooks/usePopover"
import { useUpdateApplication } from "../hooks/useUpdateApplication"
import Portal from "./Portal"
import type { Application } from "../types"

interface EditableCellProps {
  initialValue: string
  applicationId: number
  companyId?: number
  field: keyof Pick<Application, "company" | "position" | "notes">
}

type Company = { id: number; name: string }

export const EditableCell = ({ initialValue, applicationId, field }: EditableCellProps) => {
  const [value, setValue] = useState(initialValue)
  const debouncedValue = useDebouncedValue(value, 300)
  const skipSaveRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // const [openDropdown, setOpenDropdown] = useState(false)
  const { mutate, isPending } = useUpdateApplication()

  const {
    isOpen: openDropdown,
    open: openDrop,
    close: closeDrop,
    setReference,
    setFloating,
    floatingStyles,
  } = usePopover({ placement: "bottom-start" })

  // If value matches what's already saved, no filter needed — show all.
  // If value is empty, also show all — and skip the debounce.
  // Otherwise, use the debounced value for filtering.
  const searchQuery =
    value.trim() === "" || debouncedValue.trim() === initialValue.trim()
      ? ""
      : debouncedValue.trim()

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && inputRef.current === document.activeElement) {
        inputRef.current?.blur()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  const fetchCompanies = async (searchQuery: string): Promise<Company[]> => {
    console.log("Fetching companies with query:", searchQuery)
    if (field !== "company") return []
    const res = await apiClient.get<Company[]>(`/companies?search=${searchQuery}`)

    return res.data
  }

  const { data: companies, isFetching } = useQuery({
    queryKey: ["companies", searchQuery],
    queryFn: () => fetchCompanies(searchQuery),
    enabled: openDropdown && field === "company", // a query só é ativada quando o dropdown está aberto e o campo é "company"
    placeholderData: keepPreviousData, // mantém os resultados anteriores enquanto procura novos resultados
  })

  const handleOpenDropdown = async () => {
    if (field !== "company") return
    openDrop()
  }

  const handleCancel = () => {
    setValue(initialValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") {
      skipSaveRef.current = true
      closeDrop()
      handleCancel()
      e.currentTarget.blur()
    }
  }

  const handleSelectCompany = (company: Company) => {
    setValue(company.name)
    closeDrop()
    // inputRef.current?.focus()

    // Dar save imediato ao selecionar uma empresa da dropdown
    if (company.name !== initialValue) {
      mutate({ id: applicationId, data: { companyId: company.id } })
    }

    skipSaveRef.current = true
    inputRef.current?.blur()
  }

  const handleCreateCompany = () => {
    closeDrop()
    inputRef.current?.focus()
  }

  const showCreateOption =
    field === "company" &&
    value.trim() !== "" &&
    ((companies?.length ?? 0) === 0 ||
      !companies?.some((c) => c.name.toLowerCase().trim() === value.toLowerCase().trim()))

  const handleSave = () => {
    if (skipSaveRef.current) {
      skipSaveRef.current = false
      return
    }

    // Mudanças em "company" apenas acontecem através de handleSelectCompany
    // ou handleCreateCompany (TBD) - typing is just searching
    // On blur, revertemos sempre para o valor inicial
    if (field === "company") {
      setValue(initialValue)
      closeDrop()
      return
    }

    if (value !== initialValue) {
      console.log("Saving value", { value, initialValue })
      mutate({ id: applicationId, data: { [field]: value } })
    }
  }

  // Callback ref que liga DOIS refs ao mesmo input:
  // 1. inputRef - para a lógica de blur/focus local
  // 2. setReference - para o Floating UI saber a posição do trigger
  //
  // Quando um elemento precisa de dois refs, não posso simplesmente
  // fazer ref={inputRef} ref={setReference} - JSX só aceita um ref.
  const mergeInputRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (field === "company") {
      setReference(node)
    }
  }

  return (
    <>
      <input
        ref={mergeInputRefs}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          // O click outside do usePopover já fecha o dropdown
          // mas aqui garantimos que o save também acontece
          closeDrop()
          handleSave()
        }}
        onFocus={handleOpenDropdown}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        className="peer w-full p-1 outline-none bg-transparent disabled:opacity-50 disabled:cursor-wait"
      />

      {field === "company" && (
        <Link
          to="/application/$id"
          params={{ id: applicationId }}
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border px-2 py-1 rounded shadow-sm cursor-pointer select-none hidden peer-hover:inline-flex hover:inline-flex"
        >
          Open
        </Link>
      )}

      {field === "company" && openDropdown && (
        <Portal>
          <div
            ref={setFloating}
            style={floatingStyles}
            className="max-h-56 overflow-auto rounded border 
                       border-gray-200 bg-white shadow z-50"
          >
            {showCreateOption && (
              <button
                type="button"
                className="px-3 py-2 cursor-pointer hover:bg-gray-100 
                           w-full text-left border-t border-gray-200 text-blue-600"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleCreateCompany()
                }}
              >
                + Criar company: &quot;{value.trim()}&quot;
              </button>
            )}

            {companies &&
              companies.length > 0 &&
              companies.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center justify-between hover:bg-gray-100 
                              ${isFetching ? "opacity-50" : ""}`}
                >
                  <button
                    type="button"
                    className="px-3 py-2 cursor-pointer text-left flex-1"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelectCompany(c)
                    }}
                  >
                    {c.name}
                  </button>

                  <Link
                    to="/company/$id"
                    params={{ id: c.id }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 mr-2 text-xs text-gray-400 
                               hover:text-blue-600 rounded hover:bg-gray-200"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Go
                  </Link>
                </div>
              ))}
          </div>
        </Portal>
      )}
    </>
  )
}