import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormHeader } from "./FormHeader";
import { LowerLimitDetection } from "./LowerLimitDetection";
import { PrecisionSection } from "./PrecisionSection";
import { AccuracySection } from "./AccuracySection";
import { QCSection } from "./QCSection";
import { FormActions } from "./FormActions";
import { FormData, GoogleScriptResponse } from "@/types/form";
import { initialFormData, getTestData } from "@/utils/formUtils";
import { APPS_SCRIPT_URL, SPREADSHEET_CONFIG } from "@/config/constants";

export function SQAForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    section: string,
    field: string,
    value: string,
    index?: number
  ) => {
    setFormData((prev) => {
      if (typeof index === "number" && typeof prev[section] === "object") {
        const sectionData = { ...prev[section] };
        if (Array.isArray(sectionData[field])) {
          sectionData[field] = [...sectionData[field]];
          sectionData[field][index] = value;
        }
        return { ...prev, [section]: sectionData };
      }
      return { ...prev, [section]: value };
    });
  };

  const loadTestData = () => {
    setFormData(getTestData());
    toast({
      title: "Test Data Loaded",
      description: "You can now submit the form to test the Google Sheets integration.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log("Submitting form data:", formData);

    try {
      const callbackName = `callback_${Date.now()}`;
      console.log("Using callback name:", callbackName);

      // Create a promise that will resolve when the callback is called
      const responsePromise = new Promise<GoogleScriptResponse>((resolve, reject) => {
        // Set timeout to handle script loading failures
        const timeoutId = setTimeout(() => {
          reject(new Error('Request timed out after 30 seconds'));
          cleanup();
        }, 30000);

        // Create the callback function
        (window as any)[callbackName] = (response: GoogleScriptResponse) => {
          clearTimeout(timeoutId);
          console.log("Received response:", response);
          resolve(response);
          cleanup();
        };

        // Create and append the script
        const script = document.createElement('script');
        const dataToSubmit = {
          ...formData,
          sheetName: SPREADSHEET_CONFIG.TEMPLATE_SHEET_NAME
        };
        console.log("Data being sent to Google Sheets:", dataToSubmit);
        
        const encodedData = encodeURIComponent(JSON.stringify(dataToSubmit));
        script.src = `${APPS_SCRIPT_URL}?callback=${callbackName}&action=submit&data=${encodedData}`;
        console.log("Request URL:", script.src);
        
        script.onerror = () => {
          clearTimeout(timeoutId);
          reject(new Error('Failed to connect to Google Sheets. Please try again.'));
          cleanup();
        };

        document.body.appendChild(script);

        // Cleanup function
        function cleanup() {
          delete (window as any)[callbackName];
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }
      });

      const response = await responsePromise;
      console.log("Processing response:", response);

      if (response.status === 'success') {
        toast({
          title: "Success!",
          description: "Data has been submitted to Google Sheets successfully.",
        });
      } else {
        throw new Error(response.message || 'Failed to submit data');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? `Failed to submit data: ${error.message}` 
          : "Failed to submit data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>SQA Precision / Accuracy / Lower Limit Detection Study</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormActions 
            onLoadTestData={loadTestData}
            isSubmitting={isSubmitting}
          />
          <FormHeader formData={formData} handleInputChange={handleInputChange} />
          <LowerLimitDetection 
            data={formData.lowerLimitDetection}
            handleInputChange={handleInputChange}
          />
          <PrecisionSection 
            level={1}
            data={formData.precisionLevel1}
            handleInputChange={handleInputChange}
          />
          <PrecisionSection 
            level={2}
            data={formData.precisionLevel2}
            handleInputChange={handleInputChange}
          />
          <AccuracySection
            data={formData.accuracy}
            handleInputChange={handleInputChange}
          />
          <QCSection
            data={formData.qc}
            handleInputChange={handleInputChange}
          />
        </CardContent>
      </Card>
    </form>
  );
}