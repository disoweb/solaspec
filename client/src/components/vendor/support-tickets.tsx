import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageCircle, 
  Plus, 
  Send, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Package,
  Truck,
  DollarSign,
  Settings,
  FileText,
  Paperclip
} from "lucide-react";

const ticketCategories = [
  { value: 'general', label: 'General Inquiry', icon: MessageCircle },
  { value: 'order_issue', label: 'Order Issue', icon: Package },
  { value: 'product_question', label: 'Product Question', icon: FileText },
  { value: 'shipping', label: 'Shipping', icon: Truck },
  { value: 'refund', label: 'Refund Request', icon: DollarSign },
  { value: 'technical', label: 'Technical Support', icon: Settings },
  { value: 'other', label: 'Other', icon: AlertTriangle },
];

const priorities = [
  { value: 'low', label: 'Low', color: 'text-green-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

const statuses = [
  { value: 'open', label: 'Open', icon: AlertTriangle, color: 'text-red-600' },
  { value: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-600' },
  { value: 'waiting_customer', label: 'Waiting for Customer', icon: User, color: 'text-yellow-600' },
  { value: 'waiting_vendor', label: 'Waiting for Vendor', icon: Clock, color: 'text-orange-600' },
  { value: 'resolved', label: 'Resolved', icon: CheckCircle, color: 'text-green-600' },
  { value: 'closed', label: 'Closed', icon: XCircle, color: 'text-gray-600' },
];

export default function SupportTickets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [createForm, setCreateForm] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium',
    orderId: ''
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["/api/support/tickets"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/support/tickets", selectedTicket?.id, "messages"],
    enabled: !!selectedTicket?.id,
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/support/tickets", data);
    },
    onSuccess: () => {
      toast({
        title: "Ticket Created",
        description: "Your support ticket has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      setShowCreateDialog(false);
      setCreateForm({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium',
        orderId: ''
      });
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number; message: string }) => {
      await apiRequest("POST", `/api/support/tickets/${ticketId}/messages`, { message });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets", selectedTicket?.id, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
      setNewMessage('');
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, data }: { ticketId: number; data: any }) => {
      await apiRequest("PUT", `/api/support/tickets/${ticketId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Ticket Updated",
        description: "Ticket has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/support/tickets"] });
    },
  });

  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const getCategoryInfo = (category: string) => {
    return ticketCategories.find(c => c.value === category) || ticketCategories[0];
  };

  const handleViewTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setShowTicketDialog(true);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast({
        title: "Empty Message",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    addMessageMutation.mutate({
      ticketId: selectedTicket.id,
      message: newMessage.trim()
    });
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.subject || !createForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createTicketMutation.mutate(createForm);
  };

  const ticketsByStatus = {
    open: tickets?.filter((t: any) => t.status === 'open') || [],
    in_progress: tickets?.filter((t: any) => t.status === 'in_progress') || [],
    waiting: tickets?.filter((t: any) => ['waiting_customer', 'waiting_vendor'].includes(t.status)) || [],
    resolved: tickets?.filter((t: any) => ['resolved', 'closed'].includes(t.status)) || [],
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <MessageCircle className="w-6 h-6 animate-pulse mr-2" />
            <span>Loading support tickets...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Support Tickets</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Open</p>
                <p className="text-2xl font-bold">{ticketsByStatus.open.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{ticketsByStatus.in_progress.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Waiting</p>
                <p className="text-2xl font-bold">{ticketsByStatus.waiting.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{ticketsByStatus.resolved.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({ticketsByStatus.open.length + ticketsByStatus.in_progress.length + ticketsByStatus.waiting.length})
          </TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({ticketsByStatus.resolved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <TicketsList 
            tickets={[...ticketsByStatus.open, ...ticketsByStatus.in_progress, ...ticketsByStatus.waiting]} 
            onViewTicket={handleViewTicket}
          />
        </TabsContent>

        <TabsContent value="resolved">
          <TicketsList 
            tickets={ticketsByStatus.resolved} 
            onViewTicket={handleViewTicket}
          />
        </TabsContent>
      </Tabs>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={createForm.category} 
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketCategories.map(category => {
                      const Icon = category.icon;
                      return (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={createForm.priority} 
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <span className={priority.color}>{priority.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="order-id">Related Order ID (Optional)</Label>
              <Input
                id="order-id"
                value={createForm.orderId}
                onChange={(e) => setCreateForm(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="Enter order ID if related to a specific order..."
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={createForm.subject}
                onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter ticket subject..."
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your issue or question in detail..."
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTicketMutation.isPending}>
                {createTicketMutation.isPending ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTicket && (
                <div className="flex items-center gap-3">
                  <span>#{selectedTicket.ticketNumber}</span>
                  <Badge variant="outline" className={getStatusInfo(selectedTicket.status).color}>
                    {getStatusInfo(selectedTicket.status).label}
                  </Badge>
                  <Badge variant="secondary" className={getPriorityInfo(selectedTicket.priority).color}>
                    {getPriorityInfo(selectedTicket.priority).label}
                  </Badge>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{selectedTicket.subject}</h3>
                <p className="text-gray-600 mb-3">{selectedTicket.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>
                    <div className="flex items-center gap-2 mt-1">
                      {React.createElement(getCategoryInfo(selectedTicket.category).icon, { className: "w-4 h-4" })}
                      <span>{getCategoryInfo(selectedTicket.category).label}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p className="mt-1">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                  </div>
                  {selectedTicket.orderId && (
                    <div>
                      <span className="text-gray-500">Related Order:</span>
                      <p className="mt-1">#{selectedTicket.orderId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                <h4 className="font-semibold">Conversation</h4>

                {messagesLoading ? (
                  <div className="text-center py-4">
                    <MessageCircle className="w-6 h-6 animate-pulse mx-auto mb-2" />
                    <span>Loading messages...</span>
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {messages.map((message: any) => (
                      <div 
                        key={message.id} 
                        className={`p-3 rounded-lg ${
                          message.senderType === 'vendor' 
                            ? 'bg-blue-50 border-l-4 border-blue-200 ml-4' 
                            : 'bg-gray-50 border-l-4 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.senderName} 
                            <span className="text-gray-500">({message.senderType})</span>
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                            <Paperclip className="w-3 h-3" />
                            <span>{message.attachments.length} attachment(s)</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No messages yet</p>
                )}

                {/* Add Message */}
                {!['resolved', 'closed'].includes(selectedTicket.status) && (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={3}
                      />
                      <div className="flex justify-between items-center">
                        <Button variant="outline" size="sm">
                          <Paperclip className="w-4 h-4 mr-2" />
                          Attach File
                        </Button>
                        <Button onClick={handleSendMessage} disabled={addMessageMutation.isPending}>
                          <Send className="w-4 h-4 mr-2" />
                          {addMessageMutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="border-t pt-4">
                <div className="flex gap-2">
                  {selectedTicket.status === 'open' && (
                    <Button 
                      variant="outline" 
                      onClick={() => updateTicketMutation.mutate({ 
                        ticketId: selectedTicket.id, 
                        data: { status: 'resolved' } 
                      })}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Resolved
                    </Button>
                  )}

                  <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketsList({ 
  tickets, 
  onViewTicket 
}: { 
  tickets: any[]; 
  onViewTicket: (ticket: any) => void;
}) {
  const getStatusInfo = (status: string) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1];
  };

  const getCategoryInfo = (category: string) => {
    return ticketCategories.find(c => c.value === category) || ticketCategories[0];
  };

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No tickets in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket: any) => {
        const statusInfo = getStatusInfo(ticket.status);
        const priorityInfo = getPriorityInfo(ticket.priority);
        const categoryInfo = getCategoryInfo(ticket.category);
        const StatusIcon = statusInfo.icon;
        const CategoryIcon = categoryInfo.icon;

        return (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6" onClick={() => onViewTicket(ticket)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                    <h3 className="font-semibold">{ticket.subject}</h3>
                    <Badge variant="outline" className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                    <Badge variant="secondary" className={priorityInfo.color}>
                      {priorityInfo.label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <CategoryIcon className="w-4 h-4" />
                      <span>{categoryInfo.label}</span>
                    </div>
                    <span>#{ticket.ticketNumber}</span>
                    {ticket.orderId && (
                      <>
                        <span>•</span>
                        <span>Order: #{ticket.orderId}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    {ticket.lastResponseAt && (
                      <>
                        <span>•</span>
                        <span>Last response: {new Date(ticket.lastResponseAt).toLocaleDateString()}</span>
                        <span>by {ticket.lastResponseBy}</span>
                      </>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}