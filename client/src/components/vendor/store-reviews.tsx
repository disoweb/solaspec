import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Flag,
  Reply,
  ThumbsUp,
  Eye,
  AlertTriangle,
  Shield
} from "lucide-react";

export default function StoreReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["/api/store-reviews"],
  });

  const addReplyMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: number; reply: string }) => {
      await apiRequest("POST", `/api/store-reviews/${reviewId}/reply`, { reply });
    },
    onSuccess: () => {
      toast({
        title: "Reply Added",
        description: "Your reply has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/store-reviews"] });
      setShowReplyDialog(false);
      setReplyText('');
      setSelectedReview(null);
    },
  });

  const reportReviewMutation = useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: number; reason: string }) => {
      await apiRequest("POST", `/api/store-reviews/${reviewId}/report`, { reason });
    },
    onSuccess: () => {
      toast({
        title: "Review Reported",
        description: "The review has been reported to administrators.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/store-reviews"] });
    },
  });

  const handleReply = (review: any) => {
    setSelectedReview(review);
    setReplyText('');
    setShowReplyDialog(true);
  };

  const handleSubmitReply = () => {
    if (!replyText.trim()) {
      toast({
        title: "Missing Reply",
        description: "Please enter your reply.",
        variant: "destructive",
      });
      return;
    }

    addReplyMutation.mutate({
      reviewId: selectedReview.id,
      reply: replyText.trim()
    });
  };

  const getAverageRating = () => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    if (!reviews || reviews.length === 0) return Array(5).fill(0);

    const distribution = Array(5).fill(0);
    reviews.forEach((review: any) => {
      distribution[review.rating - 1]++;
    });

    return distribution.reverse(); // 5 stars first
  };

  const getRecentReviews = () => {
    if (!reviews) return [];
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return reviews.filter((review: any) => new Date(review.createdAt) > oneMonthAgo);
  };

  const ratingDistribution = getRatingDistribution();
  const recentReviews = getRecentReviews();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Star className="w-6 h-6 animate-pulse mr-2" />
            <span>Loading store reviews...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Store Reviews</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-lg">{getAverageRating()}</span>
            <span className="text-gray-600">({reviews?.length || 0} reviews)</span>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{getAverageRating()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{reviews?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">{recentReviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Reply className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Replied</p>
                <p className="text-2xl font-bold">
                  {reviews?.filter((r: any) => r.vendorReply).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map((count, index) => {
              const starCount = 5 - index;
              const percentage = reviews?.length ? (count / reviews.length) * 100 : 0;

              return (
                <div key={starCount} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{starCount}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reviews ({reviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="unanswered">
            Unanswered ({reviews?.filter((r: any) => !r.vendorReply).length || 0})
          </TabsTrigger>
          <TabsTrigger value="reported">
            Reported ({reviews?.filter((r: any) => r.isReported).length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ReviewsList 
            reviews={reviews || []} 
            onReply={handleReply}
            onReport={(reviewId, reason) => reportReviewMutation.mutate({ reviewId, reason })}
          />
        </TabsContent>

        <TabsContent value="unanswered">
          <ReviewsList 
            reviews={reviews?.filter((r: any) => !r.vendorReply) || []} 
            onReply={handleReply}
            onReport={(reviewId, reason) => reportReviewMutation.mutate({ reviewId, reason })}
          />
        </TabsContent>

        <TabsContent value="reported">
          <ReviewsList 
            reviews={reviews?.filter((r: any) => r.isReported) || []} 
            onReply={handleReply}
            onReport={(reviewId, reason) => reportReviewMutation.mutate({ reviewId, reason })}
          />
        </TabsContent>
      </Tabs>

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              {/* Original Review */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedReview.customerName}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < selectedReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                </div>
                {selectedReview.title && (
                  <h4 className="font-medium mb-1">{selectedReview.title}</h4>
                )}
                <p className="text-sm text-gray-600">{selectedReview.comment}</p>
              </div>

              {/* Reply Form */}
              <div>
                <label className="block text-sm font-medium mb-2">Your Reply</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a professional response to this review..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitReply} disabled={addReplyMutation.isPending}>
                  {addReplyMutation.isPending ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewsList({ 
  reviews, 
  onReply, 
  onReport 
}: { 
  reviews: any[]; 
  onReply: (review: any) => void;
  onReport: (reviewId: number, reason: string) => void;
}) {
  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No reviews in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: any) => (
        <Card key={review.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium">{review.customerName}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  {review.isVerifiedPurchase && (
                    <Badge variant="outline" className="text-green-600">
                      Verified Purchase
                    </Badge>
                  )}
                  {review.isReported && (
                    <Badge variant="destructive">
                      <Flag className="w-3 h-3 mr-1" />
                      Reported
                    </Badge>
                  )}
                </div>

                {review.title && (
                  <h4 className="font-medium mb-2">{review.title}</h4>
                )}

                <p className="text-gray-600 mb-3">{review.comment}</p>

                {/* Service Ratings */}
                {(review.serviceRating || review.communicationRating || review.deliveryRating) && (
                  <div className="flex gap-6 text-sm text-gray-600 mb-3">
                    {review.serviceRating && (
                      <div className="flex items-center gap-1">
                        <span>Service:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.serviceRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    )}
                    {review.communicationRating && (
                      <div className="flex items-center gap-1">
                        <span>Communication:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.communicationRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    )}
                    {review.deliveryRating && (
                      <div className="flex items-center gap-1">
                        <span>Delivery:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.deliveryRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Vendor Reply */}
                {review.vendorReply && (
                  <div className="bg-blue-50 border-l-4 border-blue-200 p-3 mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Vendor Response</span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.vendorRepliedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-blue-700">{review.vendorReply}</p>
                  </div>
                )}

                {/* Helpful Votes */}
                {review.helpfulVotes > 0 && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.helpfulVotes} people found this helpful</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>

                <div className="flex gap-1">
                  {!review.vendorReply && (
                    <Button size="sm" variant="outline" onClick={() => onReply(review)}>
                      <Reply className="w-3 h-3" />
                    </Button>
                  )}

                  {!review.isReported && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600"
                      onClick={() => onReport(review.id, 'Inappropriate content')}
                    >
                      <Flag className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}