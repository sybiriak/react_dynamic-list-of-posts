import classNames from 'classnames';
import React, { useState } from 'react';
import { client } from '../utils/fetchClient';
import { Comment } from '../types/Comment';

const defaultFormValue = {
  name: '',
  email: '',
  body: '',
};

type FormValues = typeof defaultFormValue;
type FormErrors = Partial<Record<keyof FormValues, boolean>>;
type Props = {
  postId: number;
  onAdd: (comment: Comment) => void;
};

export const NewCommentForm: React.FC<Props> = ({ postId, onAdd }) => {
  const [formValues, setFormValues] = useState<FormValues>(defaultFormValue);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setFormValues(currentValues => ({
      ...currentValues,
      [name]: value,
    }));

    setFormErrors(currentErrors => {
      const copy = { ...currentErrors };

      delete copy[name as keyof FormValues];

      return copy;
    });
  }

  function saveComment() {
    setIsLoading(true);

    client
      .post<Comment>('/comments', { ...formValues, postId })
      .then(response => {
        onAdd(response);
        setFormValues({ ...formValues, body: '' });
      })
      .finally(() => setIsLoading(false));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors: FormErrors = {};

    Object.keys(formValues).forEach(key => {
      if (!formValues[key as keyof FormValues].trim()) {
        newErrors[key as keyof FormValues] = true;
      }
    });

    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    saveComment();
  }

  function handleReset() {
    setFormValues(defaultFormValue);
    setFormErrors({});
  }

  return (
    <form
      data-cy="NewCommentForm"
      noValidate
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <div className="field" data-cy="NameField">
        <label className="label" htmlFor="comment-author-name">
          Author Name
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="text"
            name="name"
            id="comment-author-name"
            placeholder="Name Surname"
            className={classNames('input', { 'is-danger': formErrors.name })}
            value={formValues.name}
            onChange={handleChange}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-user" />
          </span>

          {formErrors.name && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>

        {formErrors.name && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Name is required
          </p>
        )}
      </div>

      <div className="field" data-cy="EmailField">
        <label className="label" htmlFor="comment-author-email">
          Author Email
        </label>

        <div className="control has-icons-left has-icons-right">
          <input
            type="text"
            name="email"
            id="comment-author-email"
            placeholder="email@test.com"
            className={classNames('input', { 'is-danger': formErrors.email })}
            value={formValues.email}
            onChange={handleChange}
          />

          <span className="icon is-small is-left">
            <i className="fas fa-envelope" />
          </span>

          {formErrors.email && (
            <span
              className="icon is-small is-right has-text-danger"
              data-cy="ErrorIcon"
            >
              <i className="fas fa-exclamation-triangle" />
            </span>
          )}
        </div>

        {formErrors.email && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Email is required
          </p>
        )}
      </div>

      <div className="field" data-cy="BodyField">
        <label className="label" htmlFor="comment-body">
          Comment Text
        </label>

        <div className="control">
          <textarea
            id="comment-body"
            name="body"
            placeholder="Type comment here"
            className={classNames('textarea', { 'is-danger': formErrors.body })}
            value={formValues.body}
            onChange={handleChange}
          />
        </div>

        {formErrors.body && (
          <p className="help is-danger" data-cy="ErrorMessage">
            Enter some text
          </p>
        )}
      </div>

      <div className="field is-grouped">
        <div className="control">
          <button
            type="submit"
            className={classNames('button', 'is-link', {
              'is-loading': isLoading,
            })}
          >
            Add
          </button>
        </div>

        <div className="control">
          {/* eslint-disable-next-line react/button-has-type */}
          <button type="reset" className="button is-link is-light">
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};
