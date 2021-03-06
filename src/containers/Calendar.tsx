import * as React from 'react';
import * as moment from 'moment';
import styled from 'styled-components';
import { CalendarMode } from '../models/CalendarMode';
import { WeeklyCalendar } from '../components/weekCalendar/WeeklyCalenldar';
import { MonthCalendar } from '../components/monthCalendar/MonthCalendar';
import { Task } from '../models';

const Container = styled.div`
    display: flex;
    flex-flow: column;
    padding: 0 10px;
`;

interface OwnProps {
    currentMoment: moment.Moment,
    mode: CalendarMode,
    tasks: Task[],
    onSelect: (selectedMoment?: moment.Moment | Task) => void,
    onUpdate: (task: Task) => void
}

type Props = OwnProps & React.HTMLAttributes<HTMLDivElement>;

export const Calendar: React.FC<Props> = ({ currentMoment, mode, tasks, onSelect, onUpdate, ...divProps }) => {
    const dragTarget = React.useRef<HTMLElement>();

    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const target = e.target as HTMLElement;
        if (target.dataset.taskid) {
            onSelect(tasks.find(task => task.id === Number(target.dataset.taskid)));
        } else if (target.dataset.datetime) {
            onSelect(moment.parseZone(target.dataset.datetime))
        }
    }
    const handleDragStart = (e: React.DragEvent) => {
        const taskId = (e.target as HTMLElement).dataset.taskid;
        if(taskId){
            e.dataTransfer.setData("taskId", taskId);
        }
    }
    const handleDrop = (e: React.DragEvent) => {
        const taskId = e.dataTransfer.getData('taskId');
        const datetime = e.dataTransfer.getData('datetime') || (e.target as HTMLElement).dataset.datetime;
        const dropTaskId = (e.target as HTMLElement).dataset.taskid;
        const dropTask = tasks.find(t => t.id === Number(dropTaskId));
        const currentTask = tasks.find(t => t.id === Number(taskId));
        let date;
        let hour;
        if(datetime) {
            date = moment.parseZone(datetime).format('YYYY-MM-DD');
            hour = moment.parseZone(datetime).hour();
        }else if(dropTask){
            date = dropTask.date;
        }
        if (currentTask && date) {
            const newTask = { ...currentTask, date };
            if(mode === CalendarMode.Week && hour !== undefined) {
                newTask.endHour += hour - newTask.startHour;
                newTask.startHour = hour;
            }
            onUpdate(newTask);
        }
        dragTarget.current = undefined;
    };
    const handerDragOver = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        if(target.dataset.datetime){
            e.dataTransfer.setData('datetime', target.dataset.datetime);
        }
        e.stopPropagation();
        e.preventDefault();
    }

    return (
        <Container {...divProps}
            onClick={handleClick}
            onDragStart={handleDragStart}
            onDragOver={handerDragOver}
            onDrop={handleDrop}>
            {mode === CalendarMode.Month && (
                <MonthCalendar
                    style={{ flex: 1 }}
                    currentMoment={currentMoment}
                    tasks={tasks}
                />
            )}
            {mode === CalendarMode.Week && (
                <WeeklyCalendar
                    style={{ flex: 1 }}
                    currentMoment={currentMoment}
                    tasks={tasks}
                />
            )}
        </Container>
    )
}
