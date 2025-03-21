
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketChat } from "@/components/tickets/TicketChat";
import { ArrowLeft, Clock, MessageSquare, AlertTriangle, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import { Ticket, TicketStatus, User } from "@/lib/types";
import { format } from "date-fns";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const TicketDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, getAllUsers } = useAuth();
  const [articleRead, setArticleRead] = useState<{[key: string]: boolean}>({});
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedSupportUser, setSelectedSupportUser] = useState<string>("");

  const supportUsers = getAllUsers().filter(u => u.role === 'support');
  
  useEffect(() => {
    const savedReadStates = localStorage.getItem(`articleRead-${id}`);
    if (savedReadStates) {
      setArticleRead(JSON.parse(savedReadStates));
    }
  }, [id]);

  useEffect(() => {
    if (Object.keys(articleRead).length > 0) {
      localStorage.setItem(`articleRead-${id}`, JSON.stringify(articleRead));
    }
  }, [articleRead, id]);
  
  const mockTicket: Ticket = {
    id: id || "TK-1001",
    title: "Cannot access reporting module",
    description: "When I try to access the reporting module, I get a 'Database connection failed' error. I've tried clearing my cache and restarting the application, but the issue persists.",
    status: "in_progress",
    priority: "high",
    erpSystem: "s4_hana",
    department: "finance",
    clientId: "client-1",
    supportId: "support-1",
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 3600000),
  };
  
  const relatedArticles = [
    {
      id: "1",
      title: "Troubleshooting Database Connection Issues",
      url: "#"
    },
    {
      id: "2", 
      title: "Common Reporting Module Errors", 
      url: "#"
    },
    {
      id: "3",
      title: "How to Clear Cache in S/4 HANA",
      url: "#"
    }
  ];
  
  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "resolved":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "closed":
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return "Open";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
    }
  };

  const getPriorityBadge = (priority: Ticket["priority"]) => {
    const variants = {
      low: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      medium: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      high: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      critical: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    };
    
    const labels = {
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    };
    
    return (
      <Badge variant="outline" className={variants[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const getERPSystemBadge = (system: Ticket["erpSystem"]) => {
    const variants = {
      s4_hana: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      sap_bydesign: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
      acumatica: "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    };
    
    const labels = {
      s4_hana: "S/4 HANA",
      sap_bydesign: "SAP ByDesign",
      acumatica: "Acumatica",
    };
    
    return (
      <Badge variant="outline" className={variants[system]}>
        {labels[system]}
      </Badge>
    );
  };

  const getDepartmentBadge = (dept: Ticket["department"]) => {
    const labels = {
      finance: "Finance",
      procurement: "Procurement",
      sales: "Sales",
      manufacturing: "Manufacturing",
      field_services: "Field Services",
      construction: "Construction",
      project_management: "Project Management",
      other: "Other",
    };
    
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
        {labels[dept]}
      </Badge>
    );
  };
  
  const handleArticleRead = (articleId: string) => {
    setArticleRead(prev => ({
      ...prev,
      [articleId]: true
    }));
    
    toast({
      title: "Article marked as read",
      description: "This article has been marked as read.",
    });
  };

  const handleReassignTicket = () => {
    if (!selectedSupportUser) {
      toast({
        title: "Error",
        description: "Please select a support agent to reassign the ticket.",
        variant: "destructive",
      });
      return;
    }

    const selectedUser = supportUsers.find(u => u.id === selectedSupportUser);
    
    toast({
      title: "Ticket reassigned",
      description: `Ticket has been reassigned to ${selectedUser?.name}.`,
    });
    
    setReassignDialogOpen(false);
    setSelectedSupportUser("");
  };

  const canReassignTicket = user?.role === 'admin' || user?.role === 'support';

  // Create the status badge component
  const StatusBadge = () => (
    <div className="flex items-center gap-2">
      {getStatusIcon(mockTicket.status)}
      <span className="font-medium">{getStatusText(mockTicket.status)}</span>
    </div>
  );

  // Create the reassign button component
  const ReassignButton = canReassignTicket ? (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-1"
      onClick={() => setReassignDialogOpen(true)}
    >
      <UserPlus className="h-4 w-4" />
      Reassign
    </Button>
  ) : null;

  return (
    <div className="h-full w-full bg-white overflow-hidden">
      <div className="px-4 pt-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/tickets")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tickets
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">
              {mockTicket.title}
            </h1>
            <p className="text-muted-foreground">
              Ticket #{mockTicket.id} • Created on {format(mockTicket.createdAt, "PPP")}
            </p>
          </div>
        </div>
      </div>
      
      <ResizablePanelGroup 
        direction="horizontal" 
        className="h-[calc(100vh-160px)]"
      >
        <ResizablePanel defaultSize={65} minSize={40}>
          <div className="h-full overflow-hidden">
            <TicketChat 
              ticket={mockTicket} 
              statusBadge={<StatusBadge />}
              priorityBadge={getPriorityBadge(mockTicket.priority)}
              reassignButton={ReassignButton}
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full overflow-y-auto p-4">
            <Card>
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="text-lg">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p>{mockTicket.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">ERP System</h3>
                      <div>{getERPSystemBadge(mockTicket.erpSystem)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Department</h3>
                      <div>{getDepartmentBadge(mockTicket.department)}</div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Submitted</h3>
                      <p>{format(mockTicket.createdAt, "PPP 'at' p")}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h3>
                      <p>{format(mockTicket.updatedAt, "PPP 'at' p")}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="text-lg">Support Agent</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                {mockTicket.supportId ? (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Jennifer Smith</p>
                      <p className="text-sm text-muted-foreground">Technical Support</p>
                      <p className="text-sm mt-2">
                        Currently working on your ticket. You can communicate directly through the chat.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No agent assigned yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader className="border-b px-4 py-3">
                <CardTitle className="text-lg">Related Articles</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <ul className="space-y-3">
                  {relatedArticles.map(article => (
                    <li key={article.id} className="flex items-center justify-between">
                      <a href={article.url} className="text-primary hover:underline">
                        {article.title}
                      </a>
                      <Button 
                        size="sm" 
                        variant={articleRead[article.id] ? "ghost" : "secondary"}
                        onClick={() => handleArticleRead(article.id)}
                        className="text-xs"
                      >
                        {articleRead[article.id] ? "Read" : "Mark as Read"}
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reassign Ticket</DialogTitle>
            <DialogDescription>
              Select a support agent to reassign this ticket to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={selectedSupportUser} onValueChange={setSelectedSupportUser}>
              {supportUsers.map((supportUser) => (
                <div key={supportUser.id} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={supportUser.id} id={`support-${supportUser.id}`} />
                  <label htmlFor={`support-${supportUser.id}`} className="cursor-pointer flex-1">
                    <div className="font-medium">{supportUser.name}</div>
                    <div className="text-sm text-muted-foreground">{supportUser.email}</div>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setReassignDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleReassignTicket}>
              Reassign Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketDetailPage;
