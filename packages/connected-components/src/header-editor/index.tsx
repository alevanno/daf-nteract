/**
 * @nteract HeaderEditor component. For demo and documentation, see:
 * https://components.nteract.io/#headereditor.
 *
 * Note: The HeaderEditor is a @nteract connected component due to the
 * fact that it contains a publish to `Bookstore` function that is active
 * when `Bookstore` is enabled in the @nteract app.
 *
 * https://github.com/jupyter/nbformat/blob/master/nbformat/v4/nbformat.v4.schema.json#L67
 */

// Vendor modules
import {
  Button,
  EditableText,
  H1,
  ITagProps,
  Position,
  Tooltip
} from "@blueprintjs/core";
import { actions, AppState, ContentRef, HostRecord } from "@nteract/core";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

// Local modules
import {
  AuthorTag,
  Container,
  EditableAuthorTag,
  EditableTag,
  MarginContainer
} from "./styled";

// Type Definitions
export interface AuthorObject {
  /**
   * Author's name
   */
  name: string;
}

export interface HeaderDataProps {
  /**
   * Authors.
   */
  authors: AuthorObject[];
  /**
   * Description.
   */
  description: string;
  /**
   * Tags.
   */
  tags: string[];
  /**
   * Title.
   */
  title: string;
}

export interface HeaderEditorBaseProps {
  /**
   * Whether or not the fields of the header can be edited.
   */
  editable: boolean;
  /**
   * Notebook content reference.
   */
  contentRef?: ContentRef;
  /**
   * The data that the header editor should be populated with.
   */
  headerData: HeaderDataProps;
  /**
   * An event handler to run whenever header fields are modified.
   */
  onChange: (props?: Partial<HeaderDataProps>) => void;
  /**
   * An event handler to handle whenever header fields are removed.
   */
  onRemove: (e: React.MouseEvent<HTMLButtonElement>, props: ITagProps) => void;
  /**
   * The theme of the header.
   */
  theme: "light" | "dark";
}

interface HeaderEditorMapStateToProps {
  /**
   * Whether publishing to `Bookstore` is enabled.
   */
  bookstoreEnabled?: boolean;
}

interface HeaderEditorMapDispatchToProps {
  /**
   * An event handler to publish notebook content to BookStore.
   */
  onPublish: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}

export type HeaderEditorProps = HeaderEditorBaseProps &
  HeaderEditorMapStateToProps &
  HeaderEditorMapDispatchToProps;

export interface HeaderEditorState {
  editMode: "none" | "author" | "tag";
}

// Constants
const addTagMessage: JSX.Element = <span>Add a tag</span>;
const addAuthorMessage: JSX.Element = <span>Add an author</span>;

class HeaderEditor extends React.PureComponent<
  HeaderEditorProps,
  HeaderEditorState
> {
  static defaultProps: Partial<HeaderEditorProps> = {
    bookstoreEnabled: false,
    editable: true,
    headerData: {
      authors: [],
      description: "",
      tags: [],
      title: ""
    },
    onChange: props => props,
    theme: "light"
  };

  constructor(props: HeaderEditorProps) {
    super(props);

    this.state = {
      editMode: "none"
    };
  }

  render(): JSX.Element | null {
    const { editable, bookstoreEnabled, headerData, onPublish } = this.props;

    return (
      <header>
        <Container>
          <H1>
            <EditableText
              value={headerData.title}
              placeholder="Edit title..."
              disabled={!editable}
              onChange={this.onTextChange}
            />
          </H1>
          <MarginContainer>
            <EditableText
              maxLength={280}
              maxLines={12}
              minLines={3}
              multiline
              placeholder="Edit description..."
              selectAllOnFocus={false}
              value={headerData.description}
              disabled={!editable}
              onChange={this.onEditorChange}
            />
          </MarginContainer>
          <div>
            {headerData.authors.length <= 0 ? null : "By "}
            {headerData.authors.map((t, i) => (
              <AuthorTag
                key={i}
                large
                minimal
                onRemove={this.onAuthorsRemove(t)}
              >
                {t.name}
              </AuthorTag>
            ))}
            {(this.state.editMode === "author" && (
              <EditableAuthorTag>
                <EditableText
                  maxLength={40}
                  className="author-entry"
                  placeholder="Enter Author Name..."
                  selectAllOnFocus
                  onConfirm={this.onAuthorsConfirm}
                  onCancel={this.onCancel}
                />
              </EditableAuthorTag>
            )) || (
              <Tooltip
                content={addAuthorMessage}
                position={Position.RIGHT}
                usePortal={false}
                disabled={!editable}
              >
                <Button
                  icon="add"
                  className="author-button"
                  onClick={this.onClick}
                  minimal
                  disabled={!editable}
                />
              </Tooltip>
            )}
          </div>
          <div>
            {headerData.tags.map((t, i) => (
              <EditableTag key={i} onRemove={this.onTagsRemove(t)}>
                {t}
              </EditableTag>
            ))}
            {(this.state.editMode === "tag" && (
              <EditableTag>
                <EditableText
                  maxLength={20}
                  placeholder="Enter Tag Name..."
                  selectAllOnFocus
                  onConfirm={this.onTagsConfirm}
                  onCancel={this.onCancel}
                />
              </EditableTag>
            )) || (
              <Tooltip
                content={addTagMessage}
                position={Position.RIGHT}
                usePortal={false}
                disabled={!editable}
              >
                {
                  <Button
                    icon="add"
                    minimal
                    onClick={this.onAdd}
                    disabled={!editable}
                  />
                }
              </Tooltip>
            )}
          </div>
          {bookstoreEnabled ? (
            <Button type={"button"} text={"Publish"} onClick={onPublish} />
          ) : null}
        </Container>
      </header>
    );
  }

  private onTextChange = (newText: string): void => {
    const { headerData, onChange } = this.props;

    if (onChange) {
      onChange({ ...headerData, title: newText });
    }
  };

  private onEditorChange = (newText: string): void => {
    const { headerData, onChange } = this.props;

    if (onChange) {
      onChange({ ...headerData, description: newText });
    }
  };

  private onAuthorsRemove = (t: any) => (
    evt: React.MouseEvent<HTMLButtonElement>,
    props: ITagProps
  ): void => {
    const { editable, headerData, onChange } = this.props;

    if (editable === true && onChange) {
      onChange({
        ...this.props.headerData,
        authors: Array.from(headerData!.authors).filter(p => {
          return p.name !== t.name;
        })
      });
    }
    return;
  };

  private onTagsRemove = (t: any) => (
    e: React.MouseEvent<HTMLButtonElement>,
    props: ITagProps
  ): void => {
    const { editable, headerData, onChange } = this.props;

    if (editable === true && onChange) {
      onChange({
        ...headerData,
        tags: headerData!.tags.filter(p => p !== t)
      });
      return;
    }
    return;
  };

  private onTagsConfirm = (e: any): void => {
    const { headerData, onChange } = this.props;

    if (onChange) {
      onChange({
        ...headerData,
        tags: [...headerData!.tags, e]
      });
    }

    this.setState({ editMode: "none" });
  };

  private onAuthorsConfirm = (e: any): void => {
    const { headerData, onChange } = this.props;

    if (onChange) {
      onChange({
        ...headerData,
        authors: [...headerData!.authors, { name: e }]
      });
    }

    this.setState({ editMode: "none" });
  };

  private onCancel = (): void => this.setState({ editMode: "none" });

  private onClick = (): void => this.setState({ editMode: "author" });

  private onAdd = (): void => this.setState({ editMode: "tag" });
}

const mapStateToProps = (
  appState: AppState,
  ownProps: HeaderEditorProps
): HeaderEditorMapStateToProps => {
  const host: HostRecord = appState.app.host;
  const isBookstoreEnabled: boolean = host.bookstoreEnabled || false;

  return {
    bookstoreEnabled: isBookstoreEnabled
  };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: { contentRef: ContentRef }
): HeaderEditorMapDispatchToProps => {
  return {
    onPublish: () =>
      dispatch(actions.publishToBookstore({ contentRef: ownProps.contentRef }))
  };
};

// We export this for testing purposes.
export { HeaderEditor };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderEditor);
