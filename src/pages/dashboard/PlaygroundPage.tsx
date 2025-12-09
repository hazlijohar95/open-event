import { useState, useCallback } from 'react'
import type { Editor, TLShapeId } from 'tldraw'
import { PlaygroundCanvas, PlaygroundToolbar } from '@/components/playground'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CalendarBlank, CheckSquare, CurrencyDollar, Note, Sparkle, Rocket } from '@phosphor-icons/react'

export function PlaygroundPage() {
  const [editor, setEditor] = useState<Editor | null>(null)
  const [, setSelectedShapeIds] = useState<TLShapeId[]>([])
  const [showFinalization, setShowFinalization] = useState(false)

  const handleEditorReady = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance)
  }, [])

  const handleSelectionChange = useCallback((shapeIds: TLShapeId[]) => {
    setSelectedShapeIds(shapeIds)
  }, [])

  // Count shapes by type
  const getShapeCounts = useCallback(() => {
    if (!editor) return { events: 0, tasks: 0, budgets: 0, notes: 0, total: 0 }

    const shapes = editor.getCurrentPageShapes()
    return {
      events: shapes.filter(s => s.type === 'event-card').length,
      tasks: shapes.filter(s => s.type === 'task-card').length,
      budgets: shapes.filter(s => s.type === 'budget-card').length,
      notes: shapes.filter(s => s.type === 'note-card').length,
      total: shapes.length,
    }
  }, [editor])

  const counts = getShapeCounts()

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col -m-3 sm:-m-4 lg:-m-6">
      {/* Toolbar */}
      <PlaygroundToolbar
        editor={editor}
        onFinalize={() => setShowFinalization(true)}
      />

      {/* Canvas */}
      <div className="flex-1 min-h-0 relative">
        <PlaygroundCanvas
          onEditorReady={handleEditorReady}
          onSelectionChange={handleSelectionChange}
        />

        {/* Minimal Empty State */}
        {counts.total === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-muted-foreground/60 text-sm">
                Click <span className="font-medium text-muted-foreground">Add Card</span> to start brainstorming
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Finalization Dialog */}
      <Dialog open={showFinalization} onOpenChange={setShowFinalization}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket size={20} weight="duotone" className="text-purple" />
              Finalize with AI
            </DialogTitle>
            <DialogDescription>
              Convert your cards into real events, tasks, and budget items.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              {counts.events > 0 && (
                <div className="flex items-center gap-3 p-3 bg-purple/5 rounded-lg">
                  <CalendarBlank size={20} weight="duotone" className="text-purple" />
                  <div>
                    <div className="font-semibold text-foreground">{counts.events}</div>
                    <div className="text-xs text-muted-foreground">Event{counts.events !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
              {counts.tasks > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-500/5 rounded-lg">
                  <CheckSquare size={20} weight="duotone" className="text-blue-500" />
                  <div>
                    <div className="font-semibold text-foreground">{counts.tasks}</div>
                    <div className="text-xs text-muted-foreground">Task{counts.tasks !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
              {counts.budgets > 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-500/5 rounded-lg">
                  <CurrencyDollar size={20} weight="duotone" className="text-green-600" />
                  <div>
                    <div className="font-semibold text-foreground">{counts.budgets}</div>
                    <div className="text-xs text-muted-foreground">Budget item{counts.budgets !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
              {counts.notes > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-500/5 rounded-lg">
                  <Note size={20} weight="duotone" className="text-amber-500" />
                  <div>
                    <div className="font-semibold text-foreground">{counts.notes}</div>
                    <div className="text-xs text-muted-foreground">Note{counts.notes !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
            </div>

            {counts.total === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No cards to finalize. Add some cards first!
              </p>
            ) : (
              <button
                onClick={() => {
                  // TODO: Implement AI finalization
                  setShowFinalization(false)
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple text-white font-medium rounded-lg hover:bg-purple/90 transition-all"
              >
                <Sparkle size={18} weight="fill" />
                Create {counts.total} item{counts.total !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
