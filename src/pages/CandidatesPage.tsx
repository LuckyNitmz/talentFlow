import React, { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Filter, User, MapPin, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  selectPaginatedCandidates,
  selectCandidatesFilters,
  selectCandidatesPagination,
  selectCandidatesLoading,
  setFilters,
  setPagination,
} from "@/features/candidates/candidatesSlice";
import { fetchCandidates } from "@/features/candidates/candidatesThunks";
import { selectJobs } from "@/features/jobs/jobsSlice";
import { RootState, AppDispatch } from "@/store";
import { Link } from "react-router-dom";
import Pagination from "@/components/Pagination";

const CandidatesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    candidates = [],
    totalCandidates = 0,
    totalPages = 0,
  } = useSelector(selectPaginatedCandidates);
  const filters = useSelector(selectCandidatesFilters);
  const pagination = useSelector(selectCandidatesPagination);
  const jobs = useSelector(selectJobs);
  const loading = useSelector(selectCandidatesLoading);

  // Load data on component mount and when filters change
  useEffect(() => {
    dispatch(
      fetchCandidates({
        search: filters.search,
        stage: filters.stage !== "all" ? filters.stage : undefined,
        job_id: filters.job_id || undefined,
        page: pagination.currentPage,
        pageSize: pagination.itemsPerPage,
      })
    );
  }, [
    dispatch,
    filters.search,
    filters.stage,
    filters.job_id,
    pagination.currentPage,
    pagination.itemsPerPage,
  ]);

  const jobsMap = useMemo(() => {
    return jobs.reduce((acc, job) => {
      acc[job.id] = job;
      return acc;
    }, {} as Record<string, any>);
  }, [jobs]);

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

  // Show loading screen when loading and no candidates yet
  if (loading && (!candidates || candidates.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-base md:text-lg font-medium mb-2">Loading candidates...</h3>
            <p className="text-sm md:text-base text-muted-foreground px-4">
              Please wait while we fetch candidate profiles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 w-10/12">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Candidates</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          View and Handle candidates across multiple job positions
        </p>
      </div>

      {/* Filters - Mobile First Responsive */}
      <div className="space-y-3 md:flex md:space-y-0 md:gap-4 mb-6">
        {/* Search - Full width on mobile, constrained on medium+ */}
        <div className="relative w-full md:flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-primary" />
          <Input
            placeholder="Search candidates..."
            value={filters.search}
            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
            className="pl-9"
          />
        </div>

        {/* Filter dropdowns - Stack on mobile, inline on medium+ */}
        <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
          {/* Stage filter */}
          <Select
            value={filters.stage || "all"}
            onValueChange={(value) =>
              dispatch(setFilters({ stage: value === "all" ? "all" : (value as any) }))
            }
          >
            <SelectTrigger className="w-full md:w-40">
              <Filter className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="screen">Screening</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="tech">Technical</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
            </SelectContent>
          </Select>

          {/* Job filter */}
          <Select
            value={filters.job_id || "all"}
            onValueChange={(value) =>
              dispatch(setFilters({ job_id: value === "all" ? "" : value }))
            }
          >
            <SelectTrigger className="w-full md:w-48">
              <Briefcase className="h-4 w-4 mr-2 text-primary" />
              <SelectValue placeholder="Job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results summary */}
      <div className="mb-4">
        <p className="text-xs md:text-sm text-muted-foreground">
          Showing{" "}
          {Math.min(
            (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
            totalCandidates
          )}{" "}
          to{" "}
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            totalCandidates
          )}{" "}
          of {totalCandidates} candidates
        </p>
      </div>

      {/* Candidates list */}
      <div className="space-y-3 md:space-y-4 mb-8">
        {candidates.length > 0 ? (
          candidates.map((candidate) => {
            const job = jobsMap[candidate.job_id];
            return (
              <Card
                key={candidate.id}
                className="mx-0 my-2 hover:shadow-md transition-all"
              >
                <CardContent className="p-4">
                  <Link to={`/candidates/${candidate.id}`} className="block">
                    {/* Mobile Layout (< md) */}
                    <div className="md:hidden">
                      <div className="flex items-start space-x-3 mb-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage
                            src={candidate.avatar}
                            alt={candidate.name}
                          />
                          <AvatarFallback>
                            {getInitials(candidate.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-base font-medium hover:text-primary transition-colors truncate pr-2">
                              {candidate.name}
                            </h3>
                            <Badge
                              className={`${getStageColor(candidate.stage)} flex-shrink-0`}
                              variant="secondary"
                            >
                              {candidate.stage}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{candidate.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 flex-shrink-0" />
                                <span>{candidate.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Briefcase className="h-3 w-3 flex-shrink-0" />
                                <span>{candidate.experience}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {candidate.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{candidate.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Applied to: <span className="font-medium">{job?.title || "Unknown Job"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Medium+ Screen Layout (>= md) */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={candidate.avatar}
                          alt={candidate.name}
                        />
                        <AvatarFallback>
                          {getInitials(candidate.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium hover:text-primary transition-colors">
                            {candidate.name}
                          </h3>
                          <Badge
                            className={getStageColor(candidate.stage)}
                            variant="secondary"
                          >
                            {candidate.stage}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-primary" />
                            <span>{candidate.email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-primary" />
                            <span>{candidate.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="h-3 w-3 text-primary" />
                            <span>{candidate.experience}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex flex-wrap gap-1">
                            {candidate.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs border-card-border shadow-down-sm">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs border-card-border shadow-down-sm">
                                +{candidate.skills.length - 3} more
                              </Badge>
                            )}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Applied to:{" "}
                            <span className="font-medium">
                              {job?.title || "Unknown Job"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <User className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium mb-2">No candidates found</h3>
              <p className="text-sm md:text-base text-muted-foreground px-4">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={totalPages}
          onPageChange={(page) =>
            dispatch(setPagination({ currentPage: page }))
          }
          showInfo={true}
          totalItems={totalCandidates}
          itemsPerPage={pagination.itemsPerPage}
        />
      )}
    </div>
  );
};

export default CandidatesPage;
