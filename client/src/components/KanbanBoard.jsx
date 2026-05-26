import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import useTaskStore from '../store/taskStore'
import useSocketStore from '../store/socketStore'
import { useParams } from 'react-router-dom'
import Badge from './Badge'
import Avatar from './Avatar'

const COLUMNS = [
  { id: 'todo',       label: 'To Do',       color: 'border-t-gray-500' },
  { id: 'inprogress', label: 'In Progress',  color: 'border-t-blue-500' },
  { id: 'done',       label: 'Done',         color: 'border-t-green-500' },
]

export default function KanbanBoard({ onTaskClick }) {
  const { tasks, reorderTask } = useTaskStore()
   const { emitTaskMoved } = useSocketStore()
  const { projectId } = useParams()

  // Group tasks by status, sorted by order field
  const getColumnTasks = (status) =>
    tasks
      .filter(t => t.status === status)
      .sort((a, b) => a.order - b.order)

  const onDragEnd = async (result) => {
    const { draggableId, source, destination } = result

    if (!destination) return
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return

    const newStatus = destination.droppableId
    const newOrder  = destination.index

    // 1. Update own board + DB
    await reorderTask(draggableId, newStatus, newOrder)

    // 2. Tell teammates via socket
    emitTaskMoved(projectId, draggableId, newStatus, newOrder)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colTasks = getColumnTasks(col.id)

          return (
            <div
              key={col.id}
              className="flex flex-col bg-gray-800/40 rounded-xl min-w-72 w-72 flex-shrink-0"
            >
              {/* Column header */}
              <div className={`border-t-2 ${col.color} rounded-t-xl px-4 pt-4 pb-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{col.label}</span>
                  <span className="text-xs bg-gray-700 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Droppable zone */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto px-3 pb-3 pt-1 flex flex-col gap-2 min-h-32 transition-colors rounded-b-xl
                      ${snapshot.isDraggingOver ? 'bg-gray-700/40' : ''}`}
                  >
                    {colTasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick(task)}
                            className={`bg-gray-900 border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow
                              ${snapshot.isDragging
                                ? 'border-violet-500 shadow-lg shadow-violet-500/20 rotate-1'
                                : 'border-gray-700 hover:border-gray-600'}`}
                          >
                            {/* Task labels */}
                            {task.labels?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {task.labels.map(label => (
                                  <span key={label}
                                    className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
                                    {label}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Task title */}
                            <p className="text-sm text-white font-medium mb-3 leading-snug">
                              {task.title}
                            </p>

                            {/* Task footer */}
                            <div className="flex items-center justify-between">
                              <Badge label={task.priority} />
                              <div className="flex items-center gap-2">
                                {task.dueDate && (
                                  <span className={`text-xs ${
                                    new Date(task.dueDate) < new Date()
                                      ? 'text-rose-400'    // overdue
                                      : 'text-gray-500'
                                  }`}>
                                    {new Date(task.dueDate).toLocaleDateString('en-IN', {
                                      day: 'numeric', month: 'short'
                                    })}
                                  </span>
                                )}
                                {task.assignee && (
                                  <Avatar name={task.assignee.name} size="sm" />
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {/* Placeholder keeps column height stable while dragging */}
                    {provided.placeholder}

                    {/* Empty column hint */}
                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs text-gray-700">Drop tasks here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}