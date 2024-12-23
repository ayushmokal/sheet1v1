import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormHeader } from "./FormHeader";
import { LowerLimitDetection } from "./LowerLimitDetection";
import { PrecisionSection } from "./PrecisionSection";

interface FormData {
  facility: string;
  date: string;
  technician: string;
  serialNumber: string;
  lowerLimitDetection: {
    conc: string[];
    msc: string[];
  };
  precisionLevel1: {
    conc: string[];
    motility: string[];
    morph: string[];
  };
  precisionLevel2: {
    conc: string[];
    motility: string[];
    morph: string[];
  };
  accuracy: {
    sqa: string[];
    manual: string[];
    sqaMotility: string[];
    manualMotility: string[];
    sqaMorph: string[];
    manualMorph: string[];
  };
}

const initialFormData: FormData = {
  facility: "",
  date: "",
  technician: "",
  serialNumber: "",
  lowerLimitDetection: {
    conc: Array(5).fill(""),
    msc: Array(5).fill(""),
  },
  precisionLevel1: {
    conc: Array(5).fill(""),
    motility: Array(5).fill(""),
    morph: Array(5).fill(""),
  },
  precisionLevel2: {
    conc: Array(5).fill(""),
    motility: Array(5).fill(""),
    morph: Array(5).fill(""),
  },
  accuracy: {
    sqa: Array(5).fill(""),
    manual: Array(5).fill(""),
    sqaMotility: Array(5).fill(""),
    manualMotility: Array(5).fill(""),
    sqaMorph: Array(5).fill(""),
    manualMorph: Array(5).fill(""),
  },
};

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz-R_FX3C-F6FhJznqnSOHuPuHqtbt0M2zdfMYATsRzogZ2IhO23FRNOsvH-1T77XdDww/exec';

export function SQAForm() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (
    section: keyof FormData,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a form data object
      const formDataObj = new FormData();
      formDataObj.append('data', JSON.stringify(formData));

      // Create the URL with parameters
      const url = `${APPS_SCRIPT_URL}?action=submit&data=${encodeURIComponent(JSON.stringify(formData))}`;

      // Create a script element
      const script = document.createElement('script');
      script.src = url;

      // Create a unique callback name
      const callbackName = 'googleScript' + Date.now();

      // Create the callback function
      (window as any)[callbackName] = function(response: any) {
        if (response.status === 'success') {
          toast({
            title: "Success!",
            description: "Data has been submitted to Google Sheets successfully.",
          });
        } else {
          throw new Error(response.message || 'Failed to submit data');
        }
        // Cleanup
        delete (window as any)[callbackName];
        document.body.removeChild(script);
      };

      // Add the callback to the URL
      script.src = `${url}&callback=${callbackName}`;

      // Handle errors
      script.onerror = () => {
        throw new Error('Failed to load the script');
      };

      // Append the script to the document
      document.body.appendChild(script);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit data. Please try again.",
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
          
          <div className="flex justify-end mt-6">
            <Button 
              type="submit" 
              className="bg-primary text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}