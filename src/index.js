import React, { useState } from "react"
import ReactDOM from "react-dom"
import "@atlaskit/css-reset"
import styled from "styled-components";
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import initialData from "./initial-data"
import Column from "./Column"

const Container = styled.div`
    display: flex;
`

const ColumnList = React.memo(function ColumnList({ column, tasks, index }) {
    const colTasks = column.taskIds.map((taskId) => tasks[taskId])
    return (
        <Column
            key={column.id}
            column={column}
            tasks={colTasks}
            index={index}
        />
    )
})

function App() {
    const [columnOrder, setColumnOrder] = useState(initialData.columnOrder)
    const [tasks, setTasks] = useState(initialData.tasks)
    const [columns, setColumns] = useState(initialData.columns)
    
    function onDragEnd({ destination, source, draggableId, type }) {
        if (!destination) {
            return
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return
        }

        if (type === "column") {
            const newColumnOrder = columnOrder.slice()
            newColumnOrder.splice(source.index, 1)
            newColumnOrder.splice(destination.index, 0, draggableId)
            setColumnOrder(newColumnOrder)
        }
        else if (type === "task") {
            
            const start = columns[source.droppableId]
            const finish = columns[destination.droppableId]
    
            if (start === finish) {
                const newTaskIds = start.taskIds.slice()
                newTaskIds.splice(source.index, 1)
                newTaskIds.splice(destination.index, 0, draggableId)
                const newColumn = {
                    ...start,
                    taskIds: newTaskIds
                }
                setColumns({
                    ...columns,
                    [newColumn.id]: newColumn
                })
            }
            else {
                const startTaskIds = start.taskIds.slice()
                const finishTaskIds = finish.taskIds.slice()
                startTaskIds.splice(source.index, 1)
                finishTaskIds.splice(destination.index, 0, draggableId)
                setColumns({
                    ...columns,
                    [start.id]: {
                        ...start,
                        taskIds: startTaskIds,
                    },
                    [finish.id]: {
                        ...finish,
                        taskIds: finishTaskIds
                    }
                })
            }
        }

    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
                droppableId="all-columns"
                direction="horizontal"
                type="column"
            >
                {(provided) => (
                    <Container
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        { columnOrder.map((columnId, index) => {
                            const column = columns[columnId]
                            return (
                                <ColumnList
                                    key={column.id}
                                    column={column}
                                    tasks={tasks}
                                    index={index}
                                />
                            )
                        })}
                        {provided.placeholder}
                    </Container>
                )}
            </Droppable>
        </DragDropContext>
    )
}

ReactDOM.render(<App />, document.getElementById("root"))
