import React, { useEffect, useMemo, useRef, useState } from 'react';
import { User } from '../types/User';
import classNames from 'classnames';
import { useOutsideClick } from '../utils/useOutsideClick';
import { client } from '../utils/fetchClient';

type Props = {
  selectedUserId: number;
  onSelect: (userId: number) => void;
};

export const UserSelector: React.FC<Props> = ({ selectedUserId, onSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isActive, setIsActive] = useState<boolean>(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    client.get<User[]>('/users').then(setUsers);
  }, []);

  useOutsideClick(container, () => {
    setIsActive(false);
  });

  const selectedUserName = useMemo(() => {
    return users.find(user => user.id === selectedUserId)?.name;
  }, [users, selectedUserId]);

  return (
    <div
      ref={container}
      data-cy="UserSelector"
      className={classNames('dropdown', { 'is-active': isActive })}
    >
      <div className="dropdown-trigger">
        <button
          type="button"
          className="button"
          aria-haspopup="true"
          aria-controls="dropdown-menu"
          onClick={() => setIsActive(!isActive)}
        >
          <span>{selectedUserName ?? 'Choose a user'}</span>

          <span className="icon is-small">
            <i className="fas fa-angle-down" aria-hidden="true" />
          </span>
        </button>
      </div>

      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {users.map(user => (
            <a
              key={user.id}
              href={`#user-${user.id}`}
              className={classNames('dropdown-item', {
                'is-active': selectedUserId === user.id,
              })}
              onClick={() => {
                onSelect(user.id);
                setIsActive(false);
              }}
            >
              {user.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
