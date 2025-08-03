import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Reply, Send, Trash2, Mail, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const MessagesManager = () => {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: isRead })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating message",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const replyToMessageMutation = useMutation({
    mutationFn: async ({ id, replyMessage }: { id: string; replyMessage: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({ 
          replied: true,
          reply_message: replyMessage,
          replied_at: new Date().toISOString(),
          is_read: true
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast({
        title: "Reply saved successfully",
        description: "Your reply has been saved to the message.",
      });
      setIsReplyDialogOpen(false);
      setReplyText("");
      setSelectedMessage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error saving reply",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast({
        title: "Message deleted successfully",
        description: "The message has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting message",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleReply = (message: any) => {
    setSelectedMessage(message);
    setReplyText(message.reply_message || "");
    setIsReplyDialogOpen(true);
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    replyToMessageMutation.mutate({
      id: selectedMessage.id,
      replyMessage: replyText.trim()
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const unreadMessages = messages?.filter(m => !m.is_read) || [];
  const readMessages = messages?.filter(m => m.is_read) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Contact Messages ({messages?.length || 0} total)
        </h3>
        <div className="flex gap-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {unreadMessages.length} unread
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {readMessages.length} read
          </Badge>
        </div>
      </div>

      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {unreadMessages.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-3 text-destructive">
                Unread Messages ({unreadMessages.length})
              </h4>
              <div className="space-y-3">
                {unreadMessages.map((message) => (
                  <Card key={message.id} className="border-destructive/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{message.name}</CardTitle>
                          <Badge variant="destructive">New</Badge>
                          {message.replied && <Badge variant="secondary">Replied</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate({ id: message.id, isRead: true })}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReply(message)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMessageMutation.mutate(message.id)}
                            disabled={deleteMessageMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{message.email}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      {message.subject && (
                        <CardDescription className="font-medium">
                          Subject: {message.subject}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{message.message}</p>
                      {message.replied && message.reply_message && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Your Reply:</p>
                          <p className="text-sm">{message.reply_message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Replied on {new Date(message.replied_at).toLocaleDateString()} at {new Date(message.replied_at).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {readMessages.length > 0 && (
            <div>
              <h4 className="text-md font-medium mb-3">
                Read Messages ({readMessages.length})
              </h4>
              <div className="space-y-3">
                {readMessages.map((message) => (
                  <Card key={message.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{message.name}</CardTitle>
                          <Badge variant="outline">Read</Badge>
                          {message.replied && <Badge variant="secondary">Replied</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate({ id: message.id, isRead: false })}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReply(message)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMessageMutation.mutate(message.id)}
                            disabled={deleteMessageMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{message.email}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      {message.subject && (
                        <CardDescription className="font-medium">
                          Subject: {message.subject}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{message.message}</p>
                      {message.replied && message.reply_message && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Your Reply:</p>
                          <p className="text-sm">{message.reply_message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Replied on {new Date(message.replied_at).toLocaleDateString()} at {new Date(message.replied_at).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No messages received yet.</p>
        </div>
      )}

      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
            <DialogDescription>
              Compose your reply to this message. This will be saved as a record in the system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Original Message:</p>
              <p className="text-sm">{selectedMessage?.message}</p>
            </div>
            
            <div>
              <label htmlFor="reply" className="text-sm font-medium mb-2 block">
                Your Reply:
              </label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                className="min-h-[120px]"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsReplyDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendReply}
                disabled={!replyText.trim() || replyToMessageMutation.isPending}
              >
                {replyToMessageMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Save Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};