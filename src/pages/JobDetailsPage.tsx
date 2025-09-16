import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Users, FileUser, MapPin, Calendar, GraduationCap} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { selectJobById, selectJobDetailLoading } from '@/features/jobs/jobsSlice';
import { fetchJobById } from '@/features/jobs/jobsThunks';
import { RootState, AppDispatch } from '@/store';
import KanbanBoard from '@/components/KanbanBoard';



const JobDetailsPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const job = useSelector((state: RootState) => (jobId ? selectJobById(state, jobId) : undefined));
  const loading = useSelector(selectJobDetailLoading);

  // Fetch job detail on mount / jobId change
  useEffect(() => {
    if (jobId) {
      dispatch(fetchJobById(jobId));
    }
  }, [dispatch, jobId]);

  // Show spinner while loading and no job data yet (matching Jobs/Candidates UI)
  if (loading && (!job || Object.keys(job).length === 0)) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-base sm:text-lg font-medium mb-2">Loading job...</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">Please wait while we fetch the job details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold">Job not found</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 px-4">The job you're looking for doesn't exist.</p>
          <Button asChild className="mt-4 w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover">
            <Link to="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'draft': return 'bg-warning text-warning-foreground';
      case 'archived': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
      {/* Header - Responsive Layout */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
        <Button variant="secondary" size="sm" asChild className="w-fit bg-secondary text-secondary-foreground hover:bg-secondary-hover">
          <Link to="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Jobs</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
        
        <div className="hidden sm:block h-6 w-px bg-border" />
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{job.title}</h1>
            <Badge className={`${getStatusColor(job.status)} w-fit`}>
              {job.status}
            </Badge>
          </div>
          
          {/* Job meta info - stacked on mobile, inline on larger screens */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-primary" />
              <span>{job.department}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-primary" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-primary" />
              <span>{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Action buttons - full width on mobile */}
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none bg-primary text-primary-foreground">
            <Link to={`/assessments/${job.id}`}>
              <FileUser className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Assessment</span>
              <span className="sm:hidden">Assessment</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Content - Responsive Tabs */}
      <Tabs defaultValue="candidates" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-full sm:max-w-md">
          <TabsTrigger value="candidates" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span>Candidates</span>
          </TabsTrigger>
          <TabsTrigger value="details" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <FileUser className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="hidden sm:inline">Job Details</span>
            <span className="sm:hidden">Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4 sm:space-y-6">
          <KanbanBoard jobId={job.id} />
        </TabsContent>

        <TabsContent value="details" className="space-y-4 sm:space-y-6">
          {/* Responsive grid - single column on mobile, 3 columns on large screens */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Main content - takes 2 columns on large screens */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {job.description || 'No description provided.'}
                  </p>
                </CardContent>
              </Card>

               {/* Tags Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs border-card-border shadow-down-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar content - single column on mobile and small screens */}
            <div className="space-y-4 sm:space-y-6">
              {/* Job Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Job Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Type</div>
                    <div className="text-sm sm:text-base">{job.type}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Department</div>
                    <div className="text-sm sm:text-base">{job.department}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Location</div>
                    <div className="text-sm sm:text-base">{job.location}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">Created</div>
                    <div className="text-sm sm:text-base">{new Date(job.created_at).toLocaleDateString()}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobDetailsPage;
