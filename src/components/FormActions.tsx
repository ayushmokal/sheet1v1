import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Mail } from "lucide-react";

interface FormActionsProps {
  onLoadTestData: () => void;
  onCreateSpreadsheet: () => void;
  onSendEmail: () => void;
  isCreatingSpreadsheet: boolean;
  isSendingEmail: boolean;
  isSubmitting: boolean;
  hasSpreadsheet: boolean;
  hasSubmittedData: boolean;
  emailTo?: string;
}

export function FormActions({ 
  onLoadTestData, 
  onCreateSpreadsheet,
  onSendEmail,
  isCreatingSpreadsheet,
  isSendingEmail,
  isSubmitting,
  hasSpreadsheet,
  hasSubmittedData,
  emailTo
}: FormActionsProps) {
  return (
    <div className="flex justify-between items-center gap-4 flex-wrap">
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onLoadTestData}
        >
          Load Test Data
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCreateSpreadsheet}
          disabled={isCreatingSpreadsheet}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {isCreatingSpreadsheet ? "Creating..." : hasSpreadsheet ? "Open Spreadsheet" : "Create Spreadsheet"}
        </Button>
        {hasSubmittedData && emailTo && (
          <Button
            type="button"
            variant="outline"
            onClick={onSendEmail}
            disabled={isSendingEmail}
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {isSendingEmail ? "Sending..." : "Send Email"}
          </Button>
        )}
      </div>
      <Button 
        type="submit" 
        className="bg-primary text-white"
        disabled={!hasSpreadsheet || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Data"}
      </Button>
    </div>
  );
}