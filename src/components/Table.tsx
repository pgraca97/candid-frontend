import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  type RowData,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { useDeleteApplication } from "../hooks/useDelApplication"
import type { Application } from "../types"

interface TableProps<TData> {
  data: TData[]
  columns: {
    [K in keyof Required<TData>]: ColumnDef<TData, TData[K]>
  }[keyof TData][]
}

declare module "@tanstack/react-table" {
  // Aqui defino o que eu quero que exista dentro de 'meta'
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    isEditable?: boolean
  }
}

const Table = ({ data, columns }: TableProps<Application>) => {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const { deleteWithConfirmation } = useDeleteApplication()

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const getCellClasses = <TValue,>(columnDef: ColumnDef<Application, TValue>) => {
    const baseClasses = "border"
    const metaClasses = columnDef.meta?.className || ""

    // Se for editável, não adiciona padding (o input vai ter)
    const paddingClasses = columnDef.meta?.isEditable ? "" : "p-1"

    return `${baseClasses} ${paddingClasses} ${metaClasses}`.trim()
  }

  return (
    <div>
      <table className="text-left border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan} className="border px-4 py-2">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={getCellClasses(cell.column.columnDef)}
                  onClick={(e) => {
                    if (cell.column.columnDef.meta?.isEditable) {
                      const target = e.currentTarget
                      target.classList.add("border-b-red-500")

                      // Adicionar borda ao td acima (mesma coluna, linha anterior)
                      const currentRow = target.parentElement as HTMLTableRowElement
                      const previousRow = currentRow.previousElementSibling as HTMLTableRowElement

                      if (previousRow) {
                        const cellIndex = Array.from(currentRow.children).indexOf(target)
                        // console.log("Cell index through tanstack method:", cell.column.getIndex()); conseguir o index da célula de outra forma
                        const cellAbove = previousRow.children[cellIndex] as HTMLTableCellElement

                        if (cellAbove) {
                          cellAbove.classList.add("border-b-red-500")
                        }
                      } else {
                        // É a primeira linha, adiciona borda ao th correspondente
                        const table = currentRow.closest("table")
                        const thead = table?.querySelector("thead")
                        const headerRow = thead?.querySelector("tr")

                        if (headerRow) {
                          const cellIndex = Array.from(currentRow.children).indexOf(target)
                          const th = headerRow.children[cellIndex] as HTMLTableCellElement

                          if (th) {
                            th.classList.add("border-b-red-500")
                          }
                        }
                      }
                    }
                  }}
                  onBlur={(e) => {
                    const target = e.currentTarget
                    target.classList.remove("border-b-red-500")

                    // Remover borda do elemento acima também
                    const currentRow = target.parentElement as HTMLTableRowElement
                    const previousRow = currentRow.previousElementSibling as HTMLTableRowElement

                    if (previousRow) {
                      const cellIndex = Array.from(currentRow.children).indexOf(target)
                      const cellAbove = previousRow.children[cellIndex] as HTMLTableCellElement

                      if (cellAbove) {
                        cellAbove.classList.remove("border-b-red-500")
                      }
                    } else {
                      // É a primeira linha, remove borda do th correspondente
                      const table = currentRow.closest("table")
                      const thead = table?.querySelector("thead")
                      const headerRow = thead?.querySelector("tr")

                      if (headerRow) {
                        const cellIndex = Array.from(currentRow.children).indexOf(target)
                        const th = headerRow.children[cellIndex] as HTMLTableCellElement

                        if (th) {
                          th.classList.remove("border-b-red-500")
                        }
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setHoveredCell(null)
                    }
                  }}
                >

                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
