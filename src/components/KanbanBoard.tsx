// KanbanBoard.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { selectCandidatesByStage } from '@/features/candidates/candidatesSlice';
import { fetchCandidatesByStage, updateCandidateStageWithTimeline } from '@/features/candidates/candidatesThunks';
import { RootState, AppDispatch } from '@/store';
import { Link } from 'react-router-dom';

interface KanbanBoardProps {
  jobId: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ jobId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const candidatesByStage = useSelector((state: RootState) => selectCandidatesByStage(state, jobId));

  // Load data
  useEffect(() => {
    dispatch(fetchCandidatesByStage(jobId));
  }, [dispatch, jobId]);

  const stages = [
    { id: 'applied', title: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { id: 'screen', title: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'tech', title: 'Technical', color: 'bg-purple-100 text-purple-800' },
    { id: 'offer', title: 'Offer', color: 'bg-orange-100 text-orange-800' },
    { id: 'hired', title: 'Hired', color: 'bg-green-100 text-green-800' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-100 text-red-800' }
  ];

  // Get stage title by id
  const getStageTitle = (stageId: string) => {
    return stages.find(stage => stage.id === stageId)?.title || stageId;
  };

  // Find candidate by id to get previous stage
  const findCandidateById = (candidateId: string) => {
    for (const stageId of Object.keys(candidatesByStage)) {
      const candidate = candidatesByStage[stageId]?.find(c => c.id === candidateId);
      if (candidate) {
        return candidate;
      }
    }
    return null;
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Find the candidate to get their name and current stage
    const candidate = findCandidateById(draggableId);
    if (!candidate) return;

    const previousStage = source.droppableId;
    const newStage = destination.droppableId;
    const previousStageTitle = getStageTitle(previousStage);
    const newStageTitle = getStageTitle(newStage);

    // Dispatch the update with timeline information
    dispatch(updateCandidateStageWithTimeline({
      candidateId: draggableId,
      candidateName: candidate.name,
      previousStage,
      newStage,
      previousStageTitle,
      newStageTitle
    }));

    toast({
      title: "Candidate moved",
      description: `${candidate.name} moved from ${previousStageTitle} to ${newStageTitle}`
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Recruitment Pipeline</h2>
        <p className="text-muted-foreground">
          Total: {Object.values(candidatesByStage).flat().length} candidates
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{stage.title}</h3>
                <Badge variant="secondary" className={stage.color}>
                  {candidatesByStage[stage.id]?.length || 0}
                </Badge>
              </div>

              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-2 min-h-[200px] p-2 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver ? 'border-primary bg-muted/50' : 'border-muted'
                    }`}
                  >
                    {candidatesByStage[stage.id]?.map((candidate, index) => (
                      <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-move transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={candidate.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(candidate.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-sm truncate">
                                    <Link
                                      to={`/candidates/${candidate.id}`}
                                      className="hover:underline"
                                    >
                                      {candidate.name}
                                    </Link>
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {candidate.email}
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                  {candidate.experience} • {candidate.location}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {candidate.skills.slice(0, 2).map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {candidate.skills.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{candidate.skills.length - 2}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Applied {new Date(candidate.applied_at).toLocaleDateString()}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;

