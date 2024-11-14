import React, { useEffect, useState } from 'react';
import { Loader } from './Loader';
import { NewCommentForm } from './NewCommentForm';
import { Post } from '../types/Post';
import { Comment } from '../types/Comment';
import { client, RequestError } from '../utils/fetchClient';

type Props = {
  post: Post;
};

export const PostDetails: React.FC<Props> = ({ post }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isFormShown, setIsFormShown] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    client
      .get(`/comments?postId=${post.id}`)
      .then(response => {
        if ((response as RequestError).error) {
          setHasError(true);

          return;
        } else if (Array.isArray(response)) {
          setComments(response);
        }
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  }, [post.id]);

  function handleCommentDelete(id: number) {
    const index = comments.findIndex(comment => comment.id === id);

    if (index === -1) {
      return;
    }

    const commentForDelete = comments[index];

    comments.splice(index, 1);
    setComments([...comments]);

    const handleError = () => {
      comments.splice(index, 0, commentForDelete);
      setComments([...comments]);
    };

    client
      .delete(`/comments/${id}`)
      .then(response => {
        if ((response as RequestError).error) {
          handleError();
        }
      })
      .catch(() => {
        handleError();
      });
  }

  return (
    <div className="content" data-cy="PostDetails">
      <div className="content" data-cy="PostDetails">
        <div className="block">
          <h2 data-cy="PostTitle">
            #{post.id}: {post.title}
          </h2>

          <p data-cy="PostBody">{post.body}</p>
        </div>

        <div className="block">
          {isLoading ? (
            <Loader />
          ) : hasError ? (
            <div className="notification is-danger" data-cy="CommentsError">
              Something went wrong
            </div>
          ) : (
            <>
              {!comments.length ? (
                <p className="title is-4" data-cy="NoCommentsMessage">
                  No comments yet
                </p>
              ) : (
                <>
                  <p className="title is-4">Comments:</p>
                  {comments.map(comment => (
                    <article
                      key={comment.id}
                      className="message is-small"
                      data-cy="Comment"
                    >
                      <div className="message-header">
                        <a
                          href={`mailto:${comment.email}`}
                          data-cy="CommentAuthor"
                        >
                          {comment.name}
                        </a>
                        <button
                          data-cy="CommentDelete"
                          type="button"
                          className="delete is-small"
                          aria-label="delete"
                          onClick={() => handleCommentDelete(comment.id)}
                        >
                          delete button
                        </button>
                      </div>

                      <div className="message-body" data-cy="CommentBody">
                        {comment.body}
                      </div>
                    </article>
                  ))}
                </>
              )}
              {!isFormShown && (
                <button
                  data-cy="WriteCommentButton"
                  type="button"
                  className="button is-link"
                  onClick={() => setIsFormShown(true)}
                >
                  Write a comment
                </button>
              )}
            </>
          )}
        </div>

        {isFormShown && (
          <NewCommentForm
            postId={post.id}
            onAdd={comment => {
              setComments([...comments, comment]);
            }}
          />
        )}
      </div>
    </div>
  );
};
