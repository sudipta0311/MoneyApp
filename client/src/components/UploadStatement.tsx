import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface UploadStatementProps {
  trigger?: React.ReactNode;
}

export function UploadStatement({ trigger }: UploadStatementProps) {
  const [open, setOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const queryClient = useQueryClient();

  const acceptedTypes = [
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.toLowerCase().split('.').pop();
    if (!['pdf', 'csv', 'xls', 'xlsx'].includes(ext || '')) {
      toast({
        title: "Unsupported file type",
        description: "Please upload a PDF, CSV, or Excel file.",
        variant: "destructive"
      });
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload-statement', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          count: data.count
        });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        toast({
          title: "Statement imported!",
          description: `${data.count} transactions added from your bank statement.`
        });
      } else {
        setResult({
          success: false,
          message: data.error || "Failed to process the file."
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while uploading. Please try again."
      });
    } finally {
      setUploading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setResult(null);
    setProgress(0);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetState, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) setTimeout(resetState, 300);
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2" data-testid="button-upload-statement">
            <Upload className="w-4 h-4" />
            Upload Statement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Import Bank Statement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result ? (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                  file && "border-green-500 bg-green-50 dark:bg-green-950/20"
                )}
                onClick={() => document.getElementById('file-input')?.click()}
                data-testid="dropzone-upload"
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.csv,.xls,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-file"
                />
                
                {file ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="text-muted-foreground hover:text-destructive"
                      data-testid="button-remove-file"
                    >
                      <X className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-foreground">Drop your bank statement here</p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, CSV, XLS, XLSX
                    </p>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-center text-muted-foreground">
                    Processing your statement...
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleClose}
                  disabled={uploading}
                  data-testid="button-cancel-upload"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  data-testid="button-confirm-upload"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import Transactions
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className={cn(
                "w-16 h-16 mx-auto rounded-full flex items-center justify-center",
                result.success ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
              )}>
                {result.success ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              
              <div>
                <p className="font-semibold text-foreground">
                  {result.success ? "Import Successful!" : "Import Failed"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.message}
                </p>
              </div>

              <Button onClick={handleClose} className="w-full" data-testid="button-done-upload">
                {result.success ? "Done" : "Try Again"}
              </Button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
            Your file is securely uploaded and processed on our servers. We never share your financial information with third parties.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
