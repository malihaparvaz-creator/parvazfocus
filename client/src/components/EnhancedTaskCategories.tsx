/* Parvaz Focus - Enhanced Task Categories Component
   Top Priority, Priority, Bonus with 3+ tasks each and add more option
*/

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, AlertCircle, Target, Sparkles } from 'lucide-react';
import { Task } from '@/lib/types';
import { nanoid } from 'nanoid';


interface TaskCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  minTasks: number;
  tasks: Task[];
}

export function EnhancedTaskCategories() {
  const { state, addNewTask, completeTaskById, updateState } = useAppContext();
  const [activeCategory, setActiveCategory] = useState<'TOP_PRIORITY' | 'PRIORITY' | 'BONUS'>('TOP_PRIORITY');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskTime, setTaskTime] = useState('25');
  const [taskSubject, setTaskSubject] = useState('');

  const mission = state.today.mission;

  const categories: Record<string, TaskCategory> = {
    TOP_PRIORITY: {
      id: 'TOP_PRIORITY',
      title: 'Top Priority',
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'bg-red-50',
      badgeColor: 'bg-red-100 text-red-800',
      minTasks: 3,
      tasks: mission.tasks.filter(t => t.priority === 'MUST_DO'),
    },
    PRIORITY: {
      id: 'PRIORITY',
      title: 'Priority',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-orange-50',
      badgeColor: 'bg-orange-100 text-orange-800',
      minTasks: 3,
      tasks: mission.tasks.filter(t => t.priority === 'SHOULD_DO'),
    },
    BONUS: {
      id: 'BONUS',
      title: 'Bonus',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-blue-50',
      badgeColor: 'bg-blue-100 text-blue-800',
      minTasks: 3,
      tasks: mission.tasks.filter(t => t.priority === 'BONUS'),
    },
  };

  const currentCategory = categories[activeCategory];
  const isMinTasksMet = currentCategory.tasks.length >= currentCategory.minTasks;

  const handleAddTask = () => {
    if (!taskTitle) return;

    const newTask: Task = {
      id: nanoid(),
      title: taskTitle,
      description: taskDescription,
      priority: activeCategory === 'TOP_PRIORITY' ? 'MUST_DO' : activeCategory === 'PRIORITY' ? 'SHOULD_DO' : 'BONUS',
      completed: false,
      estimatedTime: parseInt(taskTime) || 25,
      createdAt: new Date(),
      subject: taskSubject,
    };

    addNewTask(newTask);

    setTaskTitle('');
    setTaskDescription('');
    setTaskTime('25');
    setTaskSubject('');
    setShowAddTask(false);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key as any)}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeCategory === key
                ? `${cat.color} border-current`
                : 'bg-secondary/20 border-border/30 hover:border-border/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{cat.icon}</span>
              <p className="font-semibold text-sm">{cat.title}</p>
            </div>
            <p className="text-2xl font-bold">{cat.tasks.length}</p>
            <p className="text-xs text-muted-foreground">
              {isMinTasksMet && activeCategory === key ? '✓ Ready' : `Min: ${cat.minTasks}`}
            </p>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <Card className={`p-6 shadow-md ${currentCategory.color}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {currentCategory.icon}
            <h3 className="font-semibold">{currentCategory.title} Tasks</h3>
            <Badge className={currentCategory.badgeColor}>{currentCategory.tasks.length}</Badge>
          </div>
          <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add {currentCategory.title} Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-1 block">Task Title *</label>
                  <Input
                    placeholder="What do you need to do?"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-1 block">Description</label>
                  <Input
                    placeholder="Optional details..."
                    value={taskDescription}
                    onChange={e => setTaskDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Estimated Time (min)</label>
                    <Input
                      type="number"
                      min="5"
                      max="180"
                      value={taskTime}
                      onChange={e => setTaskTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Subject</label>
                    <Input
                      placeholder="e.g., Math, Biology"
                      value={taskSubject}
                      onChange={e => setTaskSubject(e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={handleAddTask} className="w-full">
                  Add Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {currentCategory.tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-3">No {currentCategory.title.toLowerCase()} tasks yet.</p>
            <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Add First Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add {currentCategory.title} Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Task Title *</label>
                    <Input
                      placeholder="What do you need to do?"
                      value={taskTitle}
                      onChange={e => setTaskTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Description</label>
                    <Input
                      placeholder="Optional details..."
                      value={taskDescription}
                      onChange={e => setTaskDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Estimated Time (min)</label>
                      <Input
                        type="number"
                        min="5"
                        max="180"
                        value={taskTime}
                        onChange={e => setTaskTime(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1 block">Subject</label>
                      <Input
                        placeholder="e.g., Math, Biology"
                        value={taskSubject}
                        onChange={e => setTaskSubject(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddTask} className="w-full">
                    Add Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-2">
            {currentCategory.tasks.map(task => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-border/30 hover:border-border/50 transition-all"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => completeTaskById(task.id)}
                  className="cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  )}
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {task.estimatedTime}min
                    </Badge>
                    {task.subject && (
                      <Badge variant="secondary" className="text-xs">
                        {task.subject}
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newState = { ...state };
                    newState.today.mission.tasks = newState.today.mission.tasks.filter(t => t.id !== task.id);
                    updateState(newState);
                  }}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>


    </div>
  );
}
