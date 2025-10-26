export interface FormParams {
  customTextValues?: Object[];
  afterCreate?: ({
    response,
    isValid,
  }: {
    response?: any;
    isValid?: any;
  }) => void;
  afterCreateIdCallback?: (id: number) => void;
  afterUpdate?: ({
    response,
    isValid,
  }: {
    response?: any;
    isValid?: any;
  }) => void;
  beforeDelete?: () => Promise<boolean>;
  afterDelete?: ({ response }: { response?: any }) => void;
  saveButtonText?: string;
  updateButtonText?: string;
  deleteButtonText?: string;
  hideButtons?: boolean;
  hideDeleteButton?: boolean;
  readOnly?: string[];
  isValid?: any;
  textValues?: { [index: string]: string }; //requiredText | selectText
}
