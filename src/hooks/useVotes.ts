import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Vote {
  feedback_id: string;
  vote_type: number;
}

interface VoteCounts {
  [feedbackId: string]: { upvotes: number; downvotes: number; userVote: number | null };
}

export function useVotes(feedbackIds: string[]) {
  const { user } = useAuth();
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({});
  const [loading, setLoading] = useState(true);

  const loadVotes = useCallback(async () => {
    if (feedbackIds.length === 0) {
      setVoteCounts({});
      setLoading(false);
      return;
    }

    try {
      const { data: allVotes, error } = await supabase
        .from('feedback_votes')
        .select('feedback_id, vote_type, user_id')
        .in('feedback_id', feedbackIds);

      if (error) {
        console.error('Failed to load votes:', error);
        return;
      }

      const counts: VoteCounts = {};
      feedbackIds.forEach(id => {
        counts[id] = { upvotes: 0, downvotes: 0, userVote: null };
      });

      (allVotes || []).forEach((vote: { feedback_id: string; vote_type: number; user_id: string }) => {
        if (counts[vote.feedback_id]) {
          if (vote.vote_type === 1) {
            counts[vote.feedback_id].upvotes++;
          } else if (vote.vote_type === -1) {
            counts[vote.feedback_id].downvotes++;
          }
          if (user && vote.user_id === user.id) {
            counts[vote.feedback_id].userVote = vote.vote_type;
          }
        }
      });

      setVoteCounts(counts);
    } catch (e) {
      console.error('Failed to load votes:', e);
    } finally {
      setLoading(false);
    }
  }, [feedbackIds, user]);

  useEffect(() => {
    loadVotes();
  }, [loadVotes]);

  const vote = useCallback(async (feedbackId: string, voteType: 1 | -1) => {
    if (!user) return { error: new Error('Must be logged in to vote') };

    const currentVote = voteCounts[feedbackId]?.userVote;

    // If same vote, remove it
    if (currentVote === voteType) {
      const { error } = await supabase
        .from('feedback_votes')
        .delete()
        .eq('feedback_id', feedbackId)
        .eq('user_id', user.id);

      if (error) return { error };

      setVoteCounts(prev => ({
        ...prev,
        [feedbackId]: {
          upvotes: prev[feedbackId].upvotes - (voteType === 1 ? 1 : 0),
          downvotes: prev[feedbackId].downvotes - (voteType === -1 ? 1 : 0),
          userVote: null
        }
      }));
      return { error: null };
    }

    // If changing vote or new vote
    if (currentVote) {
      // Update existing vote
      const { error } = await supabase
        .from('feedback_votes')
        .update({ vote_type: voteType })
        .eq('feedback_id', feedbackId)
        .eq('user_id', user.id);

      if (error) return { error };

      setVoteCounts(prev => ({
        ...prev,
        [feedbackId]: {
          upvotes: prev[feedbackId].upvotes + (voteType === 1 ? 1 : 0) - (currentVote === 1 ? 1 : 0),
          downvotes: prev[feedbackId].downvotes + (voteType === -1 ? 1 : 0) - (currentVote === -1 ? 1 : 0),
          userVote: voteType
        }
      }));
    } else {
      // Insert new vote
      const { error } = await supabase
        .from('feedback_votes')
        .insert({ feedback_id: feedbackId, user_id: user.id, vote_type: voteType });

      if (error) return { error };

      setVoteCounts(prev => ({
        ...prev,
        [feedbackId]: {
          upvotes: prev[feedbackId].upvotes + (voteType === 1 ? 1 : 0),
          downvotes: prev[feedbackId].downvotes + (voteType === -1 ? 1 : 0),
          userVote: voteType
        }
      }));
    }

    return { error: null };
  }, [user, voteCounts]);

  return { voteCounts, loading, vote, refresh: loadVotes };
}
