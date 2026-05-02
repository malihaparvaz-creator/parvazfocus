/* Parvaz Focus - Project Mode Page
   Purpose: Creative zone unlocked after study priorities
   Design: Soft matte, organized, inspiring
*/

import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { IdeaVaultItem, CreativeTodo, ParvazProject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, Zap, BookOpen, Target, Trash2, CheckCircle2, Circle, Edit2, X } from 'lucide-react';


export default function ProjectMode() {
  const { state, updateState } = useAppContext();
  const [activeTab, setActiveTab] = useState('todo');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newTodoProjectId, setNewTodoProjectId] = useState<string>('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoTitle, setEditingTodoTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewDetailsProjectId, setViewDetailsProjectId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [editProjectDate, setEditProjectDate] = useState('');
  const [editProjectWhere, setEditProjectWhere] = useState('');
  const [editProjectStatus, setEditProjectStatus] = useState<'ACTIVE' | 'PAUSED' | 'STOPPED'>('ACTIVE');
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaContent, setNewIdeaContent] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] = useState<'BUSINESS' | 'HOOK' | 'VIDEO' | 'QUOTE' | 'SYSTEM' | 'EXPERIMENT'>('BUSINESS');
  const [newIdeasTags, setNewIdeasTags] = useState('');
  const [newIdeaProjectId, setNewIdeaProjectId] = useState<string>('');
  const [editingVisionBoard, setEditingVisionBoard] = useState(false);
  const [visionBoardGoals, setVisionBoardGoals] = useState<string[]>([]);
  const [visionBoardPlans, setVisionBoardPlans] = useState<string[]>([]);
  const [visionBoardWhy, setVisionBoardWhy] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newPlan, setNewPlan] = useState('');
  const [newDumpContent, setNewDumpContent] = useState('');

  // Projects are locked if: any MUST_DO or SHOULD_DO task exists and not all are completed
  const priorityTasks = state.today.mission.tasks.filter(t => t.priority === 'MUST_DO' || t.priority === 'SHOULD_DO');
  const hasPriorityTasks = priorityTasks.length > 0;
  const allPriorityTasksCompleted = priorityTasks.every(t => t.completed);
  const shouldLock = hasPriorityTasks && !allPriorityTasksCompleted;

  if (shouldLock) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card className="p-8 text-center max-w-md shadow-md">
          <Zap className="w-12 h-12 mx-auto mb-4 text-accent opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Projects Locked</h2>
          <p className="text-muted-foreground">
            Complete your MUST DO tasks first to unlock the creative zone.
          </p>
        </Card>
      </div>
    );
  }

  const getProjectTasks = (projectId: string) => {
    return state.creativeTodos?.filter(t => t.projectId === projectId) || [];
  };

  const getProjectIdeas = (projectId: string) => {
    return state.user.projects.flatMap(p => p.ideas).filter(i => (i as any).projectId === projectId) || [];
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Creative Zone</h1>
          <p className="text-muted-foreground">
            {hasPriorityTasks ? 'Your projects are unlocked. Time to build.' : 'No tasks today. Dive into your projects!'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="todo">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Todo
            </TabsTrigger>
            <TabsTrigger value="parvaz">
              <Zap className="w-4 h-4 mr-2" />
              Parvaz
            </TabsTrigger>
            <TabsTrigger value="ideas">
              <Lightbulb className="w-4 h-4 mr-2" />
              Idea Vault
            </TabsTrigger>
            <TabsTrigger value="dump">
              <BookOpen className="w-4 h-4 mr-2" />
              Creative Dump
            </TabsTrigger>
            <TabsTrigger value="vision">
              <Target className="w-4 h-4 mr-2" />
              Vision Board
            </TabsTrigger>
          </TabsList>

          {/* Creative Zone Todo List */}
          <TabsContent value="todo" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Creative Todo List</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-parvaz-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Creative Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Task title"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={newTodoDescription}
                      onChange={(e) => setNewTodoDescription(e.target.value)}
                      className="min-h-20"
                    />
                    <div>
                      <label className="text-sm font-medium mb-2 block">Priority</label>
                      <select
                        value={newTodoPriority}
                        onChange={(e) => setNewTodoPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Project (Optional)</label>
                      <select
                        value={newTodoProjectId}
                        onChange={(e) => setNewTodoProjectId(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      >
                        <option value="">No Project</option>
                        {state.user.parvazProjects.map(p => (
                          <option key={p.id} value={p.id}>{formatProjectName(p.name)}</option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={() => {
                        if (newTodoTitle.trim()) {
                          const newState = { ...state };
                          if (!newState.creativeTodos) newState.creativeTodos = [];
                          newState.creativeTodos.push({
                            id: `todo_${Date.now()}`,
                            title: newTodoTitle,
                            description: newTodoDescription,
                            status: 'TODO',
                            priority: newTodoPriority,
                            projectId: newTodoProjectId || undefined,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                          });
                          updateState(newState);
                          setNewTodoTitle('');
                          setNewTodoDescription('');
                          setNewTodoPriority('MEDIUM');
                          setNewTodoProjectId('');
                        }
                      }}
                      className="w-full btn-parvaz-primary"
                    >
                      Add Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Todo List */}
            <div className="space-y-3">
              {state.creativeTodos && state.creativeTodos.length > 0 ? (
                state.creativeTodos.map((todo: CreativeTodo) => (
                  <Card key={todo.id} className="p-4 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => {
                            const newState = { ...state };
                            if (newState.creativeTodos) {
                              newState.creativeTodos = newState.creativeTodos.map((t: CreativeTodo) =>
                                t.id === todo.id
                                  ? {
                                      ...t,
                                      status: t.status === 'COMPLETED' ? 'TODO' : 'COMPLETED',
                                      updatedAt: new Date(),
                                    }
                                  : t
                              );
                              updateState(newState);
                            }
                          }}
                          className="flex-shrink-0 hover:opacity-80 transition-opacity mt-1"
                        >
                          {todo.status === 'COMPLETED' ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground hover:text-accent" />
                          )}
                        </button>

                        <div className="flex-1">
                          <p
                            className={`font-medium ${
                              todo.status === 'COMPLETED'
                                ? 'line-through text-muted-foreground'
                                : 'text-foreground'
                            }`}
                          >
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
                          )}
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {todo.status}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                todo.priority === 'HIGH'
                                  ? 'bg-red-500/20 text-red-700'
                                  : todo.priority === 'MEDIUM'
                                    ? 'bg-yellow-500/20 text-yellow-700'
                                    : 'bg-green-500/20 text-green-700'
                              }`}
                            >
                              {todo.priority}
                            </Badge>
                            {todo.projectId && (
                              <Badge variant="secondary" className="text-xs">
                                {formatProjectName(state.user.parvazProjects.find(p => p.id === todo.projectId)?.name || '')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newState = { ...state };
                            if (newState.creativeTodos) {
                              newState.creativeTodos = newState.creativeTodos.filter((t: CreativeTodo) => t.id !== todo.id);
                              updateState(newState);
                            }
                          }}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-secondary/30 rounded-lg">
                  <p className="text-muted-foreground">No tasks yet. Create your first creative task!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Parvaz Dashboard with Project Management */}
          <TabsContent value="parvaz" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Parvaz Projects</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-parvaz-primary gap-2">
                    <Plus className="w-4 h-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Project name"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                    />
                    <Input
                      placeholder="Description"
                      value={editProjectDescription}
                      onChange={(e) => setEditProjectDescription(e.target.value)}
                    />
                    <Input
                      type="date"
                      value={editProjectDate}
                      onChange={(e) => setEditProjectDate(e.target.value)}
                    />
                    <Input
                      placeholder="Where it operates (e.g., YouTube, Blog, etc.)"
                      value={editProjectWhere}
                      onChange={(e) => setEditProjectWhere(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        if (editProjectName.trim()) {
                          const newState = { ...state };
                          const newProject: ParvazProject = {
                            id: `project-${Date.now()}`,
                            name: editProjectName as any,
                            description: editProjectDescription,
                            startDate: editProjectDate ? new Date(editProjectDate) : new Date(),
                            operatesWhere: editProjectWhere,
                            status: 'ACTIVE',
                            ideas: [],
                            pendingTasks: [],
                            contentPipeline: [],
                            experiments: [],
                            platforms: [],
                            creativeApps: [],
                            totalCreativeTimeSpent: 0,
                            locked: false,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                          };
                          newState.user.parvazProjects.push(newProject);
                          updateState(newState);
                          setEditProjectName('');
                          setEditProjectDescription('');
                          setEditProjectDate('');
                          setEditProjectWhere('');
                        }
                      }}
                      className="w-full btn-parvaz-primary"
                    >
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.user.parvazProjects.map(project => (
                <Card key={project.id} className="p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-accent">{formatProjectName(project.name)}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProjectId(project.id);
                          setEditProjectName(project.name);
                          setEditProjectDescription(project.description || '');
                          setEditProjectDate(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
                          setEditProjectWhere(project.operatesWhere || '');
                          setEditProjectStatus(project.status);
                        }}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-accent" />
                      </button>
                      <button
                        onClick={() => {
                          const newState = { ...state };
                          newState.user.parvazProjects = newState.user.parvazProjects.filter(p => p.id !== project.id);
                          updateState(newState);
                        }}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Ideas</p>
                      <p className="font-semibold">{getProjectIdeas(project.id).length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Pending Tasks</p>
                      <p className="font-semibold">{getProjectTasks(project.id).length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Status</p>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setViewDetailsProjectId(project.id)}
                  >
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Idea Vault */}
          <TabsContent value="ideas" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Idea Vault</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-parvaz-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Idea
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Idea</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Idea title"
                      value={newIdeaTitle}
                      onChange={(e) => setNewIdeaTitle(e.target.value)}
                    />
                    <Textarea
                      placeholder="Describe your idea..."
                      value={newIdeaContent}
                      onChange={(e) => setNewIdeaContent(e.target.value)}
                      className="min-h-24"
                    />
                    <Input
                      placeholder="Tags (comma-separated)"
                      value={newIdeasTags}
                      onChange={(e) => setNewIdeasTags(e.target.value)}
                    />
                    <div>
                      <label className="text-sm font-medium mb-2 block">Project (Optional)</label>
                      <select
                        value={newIdeaProjectId}
                        onChange={(e) => setNewIdeaProjectId(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      >
                        <option value="">New Project Idea</option>
                        {state.user.parvazProjects.map(p => (
                          <option key={p.id} value={p.id}>{formatProjectName(p.name)}</option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={() => {
                        if (newIdeaTitle.trim()) {
                          const newState = { ...state };
                          const newIdea: IdeaVaultItem = {
                            id: `idea-${Date.now()}`,
                            title: newIdeaTitle,
                            content: newIdeaContent,
                            tags: newIdeasTags.split(',').map(t => t.trim()).filter(t => t),
                            category: newIdeaCategory,
                            createdAt: new Date(),
                          };
                          
                          if (newIdeaProjectId) {
                            newState.user.parvazProjects = newState.user.parvazProjects.map(p =>
                              p.id === newIdeaProjectId
                                ? { ...p, ideas: [...(p.ideas || []), newIdea] }
                                : p
                            );
                          } else {
                            if (newState.user.parvazProjects.length > 0) {
                              newState.user.parvazProjects[0].ideas = [...(newState.user.parvazProjects[0].ideas || []), newIdea];
                            }
                          }
                          
                          updateState(newState);
                          setNewIdeaTitle('');
                          setNewIdeaContent('');
                          setNewIdeasTags('');
                          setNewIdeaProjectId('');
                        }
                      }}
                      className="w-full btn-parvaz-primary"
                    >
                      Save Idea
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.user.parvazProjects.every(p => !p.ideas || p.ideas.length === 0) ? (
                <Card className="p-8 col-span-full text-center bg-secondary/20 border-dashed">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No ideas yet. Start capturing your thoughts.</p>
                </Card>
              ) : (
                state.user.parvazProjects.map(project =>
                  project.ideas && project.ideas.map(idea => (
                    <Card key={idea.id} className="p-4 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{idea.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{formatProjectName(project.name)}</p>
                        </div>
                        <button
                          onClick={() => {
                            const newState = { ...state };
                            newState.user.parvazProjects = newState.user.parvazProjects.map(p =>
                              p.id === project.id
                                ? { ...p, ideas: p.ideas?.filter(i => i.id !== idea.id) || [] }
                                : p
                            );
                            updateState(newState);
                          }}
                          className="p-1 hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{idea.content}</p>
                      <div className="flex gap-1 flex-wrap">
                        {idea.tags?.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </Card>
                  ))
                )
              )}
            </div>
          </TabsContent>

          {/* Creative Dump */}
          <TabsContent value="dump" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Creative Dump</h2>
                <p className="text-sm text-muted-foreground mt-1">Fast capture for fleeting ideas (14-second rule)</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="btn-parvaz-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Capture Idea
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Quick Idea Capture</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    placeholder="What's on your mind? (Don't overthink)"
                    className="min-h-24"
                    value={newDumpContent}
                    onChange={(e) => setNewDumpContent(e.target.value)}
                  />
                  <Button 
                    onClick={() => {
                      if (newDumpContent.trim()) {
                        const newState = { ...state };
                        newState.user.creativeDump.push({
                          id: `dump-${Date.now()}`,
                          content: newDumpContent,
                          createdAt: new Date(),
                          capturedAt: new Date(),
                        });
                        updateState(newState);
                        setNewDumpContent('');
                      }
                    }}
                    className="w-full btn-parvaz-primary"
                  >
                    Save
                  </Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {state.user.creativeDump.length === 0 ? (
                <Card className="p-8 text-center bg-secondary/20 border-dashed shadow-md">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No ideas captured yet. Start dumping.</p>
                </Card>
              ) : (
                state.user.creativeDump.map(item => (
                  <Card key={item.id} className="p-4 shadow-md">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">{item.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const newState = { ...state };
                          newState.user.creativeDump = newState.user.creativeDump.filter(i => i.id !== item.id);
                          updateState(newState);
                        }}
                        className="p-1 hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Vision Board */}
          <TabsContent value="vision" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Vision Board</h2>
              <Button
                onClick={() => {
                  console.log('Loading Vision Board for edit:', state.user.visionBoard);
                  setVisionBoardGoals([...state.user.visionBoard.goals]);
                  setVisionBoardPlans([...state.user.visionBoard.futurePlans]);
                  setVisionBoardWhy(state.user.visionBoard.whyYouWork);
                  setEditingVisionBoard(true);
                }}
                className="btn-parvaz-primary"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
            <Card className="p-6 shadow-md space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Goals</h3>
                <div className="space-y-2">
                  {!state.user.visionBoard?.goals || state.user.visionBoard.goals.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No goals added yet.</p>
                  ) : (
                    state.user.visionBoard.goals.filter(g => g && g.trim()).map((goal, idx) => (
                      <div key={idx} className="p-2 bg-accent/10 rounded-lg">
                        <p className="text-sm">• {goal}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h3 className="font-semibold mb-3">Future Plans</h3>
                <div className="space-y-2">
                  {!state.user.visionBoard?.futurePlans || state.user.visionBoard.futurePlans.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No plans added yet.</p>
                  ) : (
                    state.user.visionBoard.futurePlans.filter(p => p && p.trim()).map((plan, idx) => (
                      <div key={idx} className="p-2 bg-accent/10 rounded-lg">
                        <p className="text-sm">• {plan}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-border/50 pt-6">
                <h3 className="font-semibold mb-3">Why You Work</h3>
                {state.user.visionBoard?.whyYouWork && state.user.visionBoard.whyYouWork.trim() ? (
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm italic">{state.user.visionBoard.whyYouWork}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Not set yet. Define your purpose.</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Project Dialog */}
      <Dialog open={!!editingProjectId} onOpenChange={() => setEditingProjectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Project Name</label>
              <Input
                placeholder="Enter project name"
                value={editProjectName}
                onChange={(e) => {
                  setEditProjectName(e.target.value);
                  if (editingProjectId) {
                    const newState = { ...state };
                    newState.user.parvazProjects = newState.user.parvazProjects.map(p =>
                      p.id === editingProjectId ? { ...p, name: e.target.value as any, updatedAt: new Date() } : p
                    );
                    updateState(newState);
                  }
                }}
              />
            </div>
            <Textarea
              placeholder="Project description"
              value={editProjectDescription}
              onChange={(e) => {
                setEditProjectDescription(e.target.value);
                if (editingProjectId) {
                  const newState = { ...state };
                  newState.user.parvazProjects = newState.user.parvazProjects.map(p =>
                    p.id === editingProjectId ? { ...p, description: e.target.value, updatedAt: new Date() } : p
                  );
                  updateState(newState);
                }
              }}
              className="min-h-20"
            />
            <Input
              type="date"
              value={editProjectDate}
              onChange={(e) => {
                setEditProjectDate(e.target.value);
                if (editingProjectId) {
                  const newState = { ...state };
                  newState.user.parvazProjects = newState.user.parvazProjects.map(p =>
                    p.id === editingProjectId ? { ...p, startDate: new Date(e.target.value), updatedAt: new Date() } : p
                  );
                  updateState(newState);
                }
              }}
            />
            <Input
              placeholder="Where it operates (e.g., YouTube, Website, Instagram)"
              value={editProjectWhere}
              onChange={(e) => {
                setEditProjectWhere(e.target.value);
                if (editingProjectId) {
                  const newState = { ...state };
                  newState.user.parvazProjects = newState.user.parvazProjects.map(p =>
                    p.id === editingProjectId ? { ...p, operatesWhere: e.target.value, updatedAt: new Date() } : p
                  );
                  updateState(newState);
                }
              }}
            />
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={editProjectStatus}
                onChange={(e) => {
                  const newStatus = e.target.value as 'ACTIVE' | 'PAUSED' | 'STOPPED';
                  setEditProjectStatus(newStatus);
                  if (editingProjectId) {
                    const newState = { ...state };
                    newState.user.parvazProjects = newState.user.parvazProjects.map(p =>
                      p.id === editingProjectId ? { ...p, status: newStatus, updatedAt: new Date() } : p
                    );
                    updateState(newState);
                  }
                }}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="STOPPED">Stopped</option>
              </select>
            </div>
            <Button
              onClick={() => setEditingProjectId(null)}
              className="w-full btn-parvaz-primary"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewDetailsProjectId} onOpenChange={() => setViewDetailsProjectId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {viewDetailsProjectId && (() => {
            const project = state.user.parvazProjects.find(p => p.id === viewDetailsProjectId);
            return project ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Project Name</p>
                  <p className="font-semibold text-lg">{formatProjectName(project.name)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="mt-1">{project.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Operates Where</p>
                  <p className="font-medium">{project.operatesWhere || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1">{project.description || 'No description'}</p>
                </div>
                <div className="border-t border-border/50 pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Project Stats</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="p-3 bg-secondary/30">
                      <p className="text-xs text-muted-foreground">Ideas</p>
                      <p className="text-lg font-bold">{getProjectIdeas(project.id).length}</p>
                    </Card>
                    <Card className="p-3 bg-secondary/30">
                      <p className="text-xs text-muted-foreground">Tasks</p>
                      <p className="text-lg font-bold">{getProjectTasks(project.id).length}</p>
                    </Card>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Vision Board Dialog */}
      <Dialog open={editingVisionBoard} onOpenChange={setEditingVisionBoard}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vision Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Goals Section */}
            <div>
              <h3 className="font-semibold mb-3">Goals</h3>
              <div className="space-y-2 mb-3">
                {visionBoardGoals.map((goal, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-secondary/20 rounded-lg">
                    <p className="text-sm flex-1">{goal}</p>
                    <button
                      onClick={() => setVisionBoardGoals(visionBoardGoals.filter((_, i) => i !== idx))}
                      className="p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a goal"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newGoal.trim()) {
                      setVisionBoardGoals([...visionBoardGoals, newGoal]);
                      setNewGoal('');
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newGoal.trim()) {
                      setVisionBoardGoals([...visionBoardGoals, newGoal]);
                      setNewGoal('');
                    }
                  }}
                  className="btn-parvaz-primary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Future Plans Section */}
            <div className="border-t border-border/50 pt-6">
              <h3 className="font-semibold mb-3">Future Plans</h3>
              <div className="space-y-2 mb-3">
                {visionBoardPlans.map((plan, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-secondary/20 rounded-lg">
                    <p className="text-sm flex-1">{plan}</p>
                    <button
                      onClick={() => setVisionBoardPlans(visionBoardPlans.filter((_, i) => i !== idx))}
                      className="p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a plan"
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newPlan.trim()) {
                      setVisionBoardPlans([...visionBoardPlans, newPlan]);
                      setNewPlan('');
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    if (newPlan.trim()) {
                      setVisionBoardPlans([...visionBoardPlans, newPlan]);
                      setNewPlan('');
                    }
                  }}
                  className="btn-parvaz-primary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Why You Work Section */}
            <div className="border-t border-border/50 pt-6">
              <h3 className="font-semibold mb-3">Why You Work</h3>
              <Textarea
                placeholder="What drives you? What's your purpose?"
                value={visionBoardWhy}
                onChange={(e) => setVisionBoardWhy(e.target.value)}
                className="min-h-24"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={() => {
                const newState = { ...state };
                newState.user.visionBoard = {
                  id: newState.user.visionBoard?.id || 'vb1',
                  goals: visionBoardGoals.filter(g => g.trim()),
                  futurePlans: visionBoardPlans.filter(p => p.trim()),
                  whyYouWork: visionBoardWhy.trim(),
                  updatedAt: new Date(),
                };
                console.log('Saving Vision Board:', newState.user.visionBoard);
                updateState(newState);
                setEditingVisionBoard(false);
              }}
              className="w-full btn-parvaz-primary"
            >
              Save Vision Board
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IdeaCard({ idea }: { idea: IdeaVaultItem }) {
  return (
    <Card className="p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <Badge variant="outline">{idea.category}</Badge>
        <button className="text-muted-foreground hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <h3 className="font-semibold mb-2">{idea.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{idea.content}</p>
      <div className="flex flex-wrap gap-1">
        {idea.tags.map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </Card>
  );
}

function formatProjectName(name: string): string {
  return name.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
}
