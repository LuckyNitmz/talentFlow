import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Plus,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  selectCandidateById,
  selectCandidateDetailLoading
} from "@/features/candidates/candidatesSlice";
import { fetchCandidateById, addCandidateNote } from "@/features/candidates/candidatesThunks";
import { selectJobById } from "@/features/jobs/jobsSlice";
import { RootState, AppDispatch } from "@/store";

const CandidateDetailsPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const candidate = useSelector((state: RootState) =>
    candidateId ? selectCandidateById(state, candidateId) : null
  );
  const loading = useSelector(selectCandidateDetailLoading);
  const job = useSelector((state: RootState) =>
    candidate ? selectJobById(state, candidate.job_id) : null
  );

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  // Load candidate data
  useEffect(() => {
    if (candidateId) {
      dispatch(fetchCandidateById(candidateId));
    }
  }, [dispatch, candidateId]);

  // Show spinner while loading and no candidate data yet (matches JobsPage behavior)
  if (loading && (!candidate || Object.keys(candidate).length === 0)) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-base sm:text-lg font-medium mb-2">Loading candidate...</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Please wait while we fetch the candidate profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not loading and no candidate, show not-found state
  if (!candidate) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-8 w-10/12">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Candidate not found</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 px-4">
            The candidate you're looking for doesn't exist.
          </p>
          <Button asChild className="mt-4 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover">
            <Link to="/candidates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "screen":
        return "bg-yellow-100 text-yellow-800";
      case "tech":
        return "bg-purple-100 text-purple-800";
      case "offer":
        return "bg-orange-100 text-orange-800";
      case "hired":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    dispatch(
      addCandidateNote({
        candidateId: candidate.id,
        content: noteContent,
      })
    );

    setNoteContent("");
    setIsNoteModalOpen(false);

    toast({
      title: "Note added",
      description: "Note has been added to candidate profile.",
    });
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case "applied":
        return "📝";
      case "screen":
        return "📞";
      case "tech":
        return "💻";
      case "offer":
        return "🎯";
      case "hired":
        return "✅";
      case "rejected":
        return "❌";
      case "note_added":
        return "📝";
      default:
        return "📋";
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
        <Button variant="secondary" size="sm" asChild className="w-fit bg-secondary text-secondary-foreground hover:bg-secondary-hover">
          <Link to="/candidates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Candidates</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
        
        <div className="hidden sm:block h-6 w-px bg-border" />
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto sm:mx-0">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback className="text-sm sm:text-xl">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{candidate.name}</h1>
                <Badge
                  className={`${getStageColor(candidate.stage)} w-fit mx-auto sm:mx-0 border-card-border`}
                  variant="secondary"
                >
                  {candidate.stage}
                </Badge>
              </div>
              
              {/* Contact info - stacked on mobile, inline on larger screens */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-primary" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-primary" />
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-primary" />
                  <span>{candidate.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover">
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:hidden">Add Note</span>
              <span className="hidden sm:inline">Add Note</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4 sm:mx-0 !ml-0 !mr-0 w-[95%] bg-card border-card-border">
            <form onSubmit={handleAddNote}>
              <DialogHeader>
                <DialogTitle className="text-foreground">Add Note</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="note-content" className="text-foreground">Note</Label>
                <Textarea
                  id="note-content"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add your note here..."
                  className="mt-2 bg-input border-input text-foreground"
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={!noteContent.trim()} 
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
                >
                  Add Note
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content - responsive grid layout */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Job Application */}
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-foreground">Current Application</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-medium text-sm sm:text-base text-foreground">
                    {job?.title || "Unknown Position"}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Applied on{" "}
                    {new Date(candidate.applied_at).toLocaleDateString()}
                  </p>
                </div>
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover" size="sm" asChild>
                  <Link to={`/jobs/${candidate.job_id}`}>View Job</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
                <MessageSquare className="h-4 w-4 text-primary" />
                Notes ({candidate.notes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.notes.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {candidate.notes.map((note) => (
                    <div
                      key={note.id}
                      className="border-l-2 border-primary pl-3 sm:pl-4"
                    >
                      <p className="text-xs sm:text-sm text-muted-foreground">{note.content}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{note.created_by}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground">No notes added yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-foreground">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {candidate.timeline.map((event) => (
                  <div key={event.id} className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center text-xs sm:text-sm">
                      {getTimelineIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground">{event.message}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{event.created_by}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>
                          {new Date(event.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Contact Information */}
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-foreground">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm truncate text-muted-foreground">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">{candidate.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">{candidate.experience}</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg text-foreground">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {candidate.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs border-card-border">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsPage;
