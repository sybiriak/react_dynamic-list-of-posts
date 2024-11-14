import classNames from 'classnames';

import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './App.scss';

import { PostsList } from './components/PostsList';
import { PostDetails } from './components/PostDetails';
import { UserSelector } from './components/UserSelector';
import { Loader } from './components/Loader';
import { useState } from 'react';
import { Post } from './types/Post';
import { client, RequestError } from './utils/fetchClient';

export const App = () => {
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleUserChange = (userId: number) => {
    setSelectedUserId(userId);
    setSelectedPost(null);
    setIsLoading(true);
    setHasError(false);

    client
      .get<Post[] | RequestError>(`/posts?userId=${userId}`)
      .then(response => {
        if ((response as RequestError).error) {
          setHasError(true);

          return;
        } else if (Array.isArray(response)) {
          setPosts(response);
        }
      })
      .catch(() => setHasError(true))
      .finally(() => setIsLoading(false));
  };

  return (
    <main className="section">
      <div className="container">
        <div className="tile is-ancestor">
          <div className="tile is-parent">
            <div className="tile is-child box is-success">
              <div className="block">
                <UserSelector
                  onSelect={handleUserChange}
                  selectedUserId={selectedUserId}
                />
              </div>

              <div className="block" data-cy="MainContent">
                {!selectedUserId ? (
                  <p data-cy="NoSelectedUser">No user selected</p>
                ) : isLoading ? (
                  <Loader />
                ) : hasError ? (
                  <div
                    className="notification is-danger"
                    data-cy="PostsLoadingError"
                  >
                    Something went wrong!
                  </div>
                ) : !!posts.length ? (
                  <PostsList
                    posts={posts}
                    selectedPost={selectedPost}
                    onSelect={setSelectedPost}
                  />
                ) : (
                  <div className="notification is-warning" data-cy="NoPostsYet">
                    No posts yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            data-cy="Sidebar"
            className={classNames(
              'tile',
              'is-parent',
              'is-8-desktop',
              'Sidebar',
              { 'Sidebar--open': !!selectedPost },
            )}
          >
            <div className="tile is-child box is-success ">
              {selectedPost && (
                <PostDetails post={selectedPost} key={selectedPost.id} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
