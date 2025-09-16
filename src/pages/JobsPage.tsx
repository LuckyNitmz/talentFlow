import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit2, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { selectPaginatedJobs, selectJobsFilters, selectJobsPagination, selectJobsLoading, setFilters, setPagination } from '@/features/jobs/jobsSlice';
import { fetchJobs, createJob, updateJob, deleteJob, reorderJobs } from '@/features/jobs/jobsThunks';
import { Link } from 'react-router-dom';
import Pagination from '@/components/Pagination';
import { RootState, AppDispatch } from '@/store';

const JobsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  
  const isReorderingRef = useRef(false);
  
  const loading = useSelector(selectJobsLoading);
  const { jobs, totalJobs, totalPages } = useSelector(selectPaginatedJobs);
  const filters = useSelector(selectJobsFilters);
  const pagination = useSelector(selectJobsPagination);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    location: string;
    type: string;
    department: string;
    tags: string;
    status: 'active' | 'draft' | 'archived';
  }>({
    title: '',
    description: '',
    location: '',
    type: 'Full-time',
    department: '',
    tags: '',
    status: 'active'
  });

  useEffect(() => {
    if (isReorderingRef.current) {
      isReorderingRef.current = false;
      return;
    }
    
    dispatch(fetchJobs({
      search: filters.search,
      status: filters.status !== 'all' ? filters.status : undefined,
      page: pagination.currentPage,
      pageSize: pagination.itemsPerPage
    }));
  }, [dispatch, filters.search, filters.status, pagination.currentPage, pagination.itemsPerPage]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !jobs || jobs.length === 0) return;
    
    const jobIds = jobs.map(job => job.id);
    const [reorderedItem] = jobIds.splice(result.source.index, 1);
    jobIds.splice(result.destination.index, 0, reorderedItem);
    
    try {
      isReorderingRef.current = true;
      await dispatch(reorderJobs(jobIds)).unwrap();
      
      toast({
        title: "Jobs reordered",
        description: "Job order has been updated successfully."
      });
    } catch (error: any) {
      isReorderingRef.current = false;
      
      toast({
        title: "Reorder failed",
        description: error?.message || "Failed to reorder jobs",
        variant: "destructive"
      });
      
      dispatch(fetchJobs({
        search: filters.search,
        status: filters.status !== 'all' ? filters.status : undefined,
        page: pagination.currentPage,
        pageSize: pagination.itemsPerPage
      }));
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Job title is required.",
        variant: "destructive"
      });
      return;
    }
    
    dispatch(createJob({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }));
    
    setIsCreateModalOpen(false);
    setFormData({
      title: '',
      description: '',
      location: '',
      type: 'Full-time',
      department: '',
      tags: '',
      status: 'active'
    });
    
    toast({
      title: "Job created",
      description: "New job has been created successfully."
    });
  };

  const handleEditJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Job title is required.",
        variant: "destructive"
      });
      return;
    }
    
    dispatch(updateJob({
      id: editingJob.id,
      updates: {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }
    }));
    
    setIsEditModalOpen(false);
    setEditingJob(null);
    
    toast({
      title: "Job updated",
      description: "Job has been updated successfully."
    });
  };

  const openEditModal = (job: any) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      type: job.type,
      department: job.department,
      tags: job.tags.join(', '),
      status: job.status
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteJob = (jobId: string) => {
    dispatch(deleteJob(jobId));
    toast({
      title: "Job deleted",
      description: "Job has been deleted successfully."
    });
  };

  const handleToggleArchive = (job: any) => {
    dispatch(updateJob({
      id: job.id,
      updates: { status: job.status === 'archived' ? 'active' : 'archived' }
    }));
    
    toast({
      title: job.status === 'archived' ? "Job unarchived" : "Job archived",
      description: `Job has been ${job.status === 'archived' ? 'unarchived' : 'archived'} successfully.`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'draft':
        return 'bg-warning text-warning-foreground';
      case 'archived':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading && (!jobs || jobs.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-base md:text-lg font-medium mb-2">Loading jobs...</h3>
            <p className="text-sm md:text-base text-muted-foreground px-4">Please wait while we fetch your job listings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 w-10/12">
      {/* Header - Responsive Layout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold">Jobs</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Manage your job postings and track applications
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="md:hidden">Create Job</span>
              <span className="hidden md:inline">Create Job</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="!ml-0 !mr-0 w-[95%] mx-4 md:mx-0 sm:max-w-[600px]">
            <form onSubmit={handleCreateJob}>
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">Create New Job</DialogTitle>
                <DialogDescription className="text-sm">
                  Add a new job posting to your recruitment pipeline.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-sm">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Frontend Developer"
                    className="text-sm"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Job description..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="location" className="text-sm">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="type" className="text-sm">Job Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department" className="text-sm">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Engineering"
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="status" className="text-sm">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tags" className="text-sm">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. React, TypeScript, Remote (comma separated)"
                    className="text-sm"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={!formData.title.trim()} className="w-full md:w-auto">
                  Create Job
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters - Responsive Layout */}
      <div className="space-y-3 md:flex md:space-y-0 md:gap-4 mb-6">
        <div className="relative w-full md:flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
          <Input
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
            className="pl-9 text-sm"
          />
        </div>
        
        <Select
          value={filters.status}
          onValueChange={(value) => dispatch(setFilters({ status: value as any }))}
        >
          <SelectTrigger className="w-full md:w-40 text-sm">
            <Filter className="h-4 w-4 mr-2 text-primary" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results info */}
      <div className="mb-4">
        <p className="text-xs md:text-sm text-muted-foreground">
          Showing {jobs?.length || 0} of {totalJobs} jobs
        </p>
      </div>

      {/* Jobs List */}
      {jobs && jobs.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="jobs">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 md:space-y-4 mb-8"
              >
                {jobs.map((job, index) => (
                  <Draggable key={job.id} draggableId={job.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`transition-transform cursor-grab active:cursor-grabbing ${
                          snapshot.isDragging ? 'scale-105 shadow-lg rotate-2' : ''
                        }`}
                      >
                        <Card className="hover:shadow-md transition-all duration-200 select-none">
                          <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                            <div className="flex items-start md:items-center justify-between gap-3">
                              <div className="flex items-start md:items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                                {/* <div className="p-2 md:p-1 hover:bg-muted rounded touch-manipulation flex-shrink-0">
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </div> */}
                                
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-base md:text-lg">
                                    <Link 
                                      to={`/jobs/${job.id}`} 
                                      className="hover:text-primary transition-colors"
                                      onClick={(e) => {
                                        // Prevent link navigation when dragging
                                        if (snapshot.isDragging) {
                                          e.preventDefault();
                                        }
                                      }}
                                    >
                                      <span className="line-clamp-1">{job.title}</span>
                                    </Link>
                                  </CardTitle>
                                  <CardDescription className="text-xs md:text-sm mt-1">
                                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                                      <span>{job.department}</span>
                                      <span className="hidden md:inline">•</span>
                                      <span>{job.location}</span>
                                      <span className="hidden md:inline">•</span>
                                      <span>{job.type}</span>
                                    </div>
                                  </CardDescription>
                                </div>
                              </div>
                              
                              <div 
                                className="flex items-center gap-2 flex-shrink-0"
                                onClick={(e) => {
                                  // Prevent event bubbling when clicking on interactive elements
                                  e.stopPropagation();
                                }}
                              >
                                <Badge className={`${getStatusColor(job.status)} text-xs`} variant="secondary">
                                  {job.status}
                                </Badge>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                      <Link to={`/jobs/${job.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEditModal(job)}>
                                      <Edit2 className="h-4 w-4 mr-2" />
                                      Edit Job
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleToggleArchive(job)}>
                                      <Archive className="h-4 w-4 mr-2" />
                                      {job.status === 'archived' ? 'Unarchive' : 'Archive'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="pt-0 p-3 md:p-6 md:pt-0">
                            <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">
                              {job.description || 'No description provided.'}
                            </p>
                            
                            <div className="flex flex-wrap gap-1">
                              {job.tags?.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs border-card-border shadow-down-sm">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center px-4">
            <h3 className="text-base md:text-lg font-medium mb-2">No jobs found</h3>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              {filters.search || filters.status !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first job posting'
              }
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          onPageChange={(page) => dispatch(setPagination({ currentPage: page }))}
          showInfo={true}
          totalItems={totalJobs}
          itemsPerPage={pagination.itemsPerPage}
        />
      )}

      {/* Edit Job Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="!ml-0 !mr-0 w-[95%] mx-4 md:mx-0 sm:max-w-[600px]">
          <form onSubmit={handleEditJob}>
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">Edit Job</DialogTitle>
              <DialogDescription className="text-sm">
                Update the job posting details.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title" className="text-sm">Job Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-sm"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-sm">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="text-sm"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-location" className="text-sm">Location</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="text-sm"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-type" className="text-sm">Job Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-department" className="text-sm">Department</Label>
                  <Input
                    id="edit-department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="text-sm"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-status" className="text-sm">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-tags" className="text-sm">Tags</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={!formData.title.trim()} className="w-full md:w-auto">
                Update Job
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobsPage;
