/**
 * @fileoverview Shift import component for CSV file uploads
 * @description Drag-and-drop CSV importer with bulk shift creation
 */

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/ui/button';
import { ThemedProgress } from '../ui/enhanced-components';
import { Card, CardContent } from '@/ui/card';
import { Shift } from '@/api/entities';
import { toast } from 'sonner';

/**
 * Shift import component with CSV parsing
 * @returns {JSX.Element} Import interface with drag-and-drop
 */
function ShiftImport() {
    const [files, setFiles] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);

    /**
     * Handle drag over event
     * @param {React.DragEvent} e - Drag event
     */
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    /**
     * Handle drag leave event
     * @param {React.DragEvent} e - Drag event
     */
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    /**
     * Handle file drop event
     * @param {React.DragEvent} e - Drop event
     */
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        const csvFiles = droppedFiles.filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
        if (csvFiles.length > 0) {
            setFiles([csvFiles[0]]); // Take only the first CSV file
        } else {
            toast.error('Please drop a CSV file');
        }
    };

    /**
     * Handle file input change
     * @param {React.ChangeEvent} e - Input change event
     */
    const handleFileInput = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const csvFiles = selectedFiles.filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
        if (csvFiles.length > 0) {
            setFiles([csvFiles[0]]);
        }
    };

    /**
     * Parse CSV and import shifts to database
     */
    const parseAndImport = async () => {
        if (files.length === 0) return;

        setIsParsing(true);
        setProgress(0);
        const file = files[0];
        const reader = new FileReader();

        reader.onload = async (event) => {
            const csvData = event.target.result;
            const rows = csvData.split('\n').slice(1); // Assume header row
            const totalRows = rows.length;
            let importedCount = 0;
            let errorCount = 0;

            const shiftsToCreate = [];

            for (let i = 0; i < totalRows; i++) {
                const row = rows[i].trim();
                if (!row) continue;
                
                const [title, start_datetime, end_datetime, scheduled_hours_str] = row.split(',');

                try {
                    const scheduled_hours = parseFloat(scheduled_hours_str);
                    if (!title || !start_datetime || !end_datetime || isNaN(scheduled_hours) || !Date.parse(start_datetime) || !Date.parse(end_datetime)) {
                        throw new Error(`Invalid row data on line ${i+2}`);
                    }

                    shiftsToCreate.push({
                        title,
                        start_datetime,
                        end_datetime,
                        scheduled_hours,
                        import_source: 'csv',
                    });
                } catch (err) {
                    errorCount++;
                    if (import.meta.env.DEV) {
                        console.error(`Failed to parse row ${i+1}:`, err);
                    }
                    toast.error(`Import Error on row ${i + 2}`, { description: err.message });
                }
            }

            if (shiftsToCreate.length > 0) {
                try {
                  await Shift.bulkCreate(shiftsToCreate);
                  importedCount = shiftsToCreate.length;
                } catch(e) {
                  errorCount += shiftsToCreate.length;
                  toast.error('Bulk Import Failed', { description: 'Could not save shifts to the database.' });
                }
            }
            
            setProgress(100);
            
            if (importedCount > 0) {
                toast.success('Import Complete', {
                    description: `${importedCount} shifts imported successfully. ${errorCount} rows failed.`,
                });
            } else if (errorCount > 0) {
                toast.error('Import Failed', {
                    description: `All ${errorCount} rows contained errors. Please check the file and try again.`
                });
            }
            
            setIsParsing(false);
            setFiles([]);
        };

        reader.readAsText(file);
    };

    return (
        <Card className="bg-card">
            <CardContent className="p-6">
                <div
                    className={`
                        flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                        ${isDragOver 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border bg-muted/50 hover:border-border/80 hover:bg-muted/70'
                        }
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input')?.click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept=".csv"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    {isDragOver ? (
                        <p className="font-semibold text-primary">Drop the CSV file here</p>
                    ) : (
                        <>
                            <p className="text-foreground">Drag & drop a CSV file, or <span className="font-semibold text-primary">click to select</span></p>
                            <em className="text-xs text-muted-foreground mt-2">(Only *.csv files will be accepted)</em>
                        </>
                    )}
                </div>

                {files.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-semibold text-foreground mb-2">Selected File</h4>
                        <div className="flex items-center p-3 border border-border rounded-lg bg-muted/50">
                            <FileText className="h-6 w-6 text-primary" />
                            <p className="ml-3 text-sm text-foreground">{files[0].name}</p>
                            <button
                                onClick={() => setFiles([])}
                                className="ml-auto text-muted-foreground hover:text-foreground"
                                aria-label="Remove file"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {isParsing && (
                    <div className="mt-6">
                        <ThemedProgress value={progress} />
                        <p className="text-sm text-center mt-2 text-muted-foreground">Importing... {Math.round(progress)}%</p>
                    </div>
                )}
                
                <div className="mt-6 flex justify-end">
                    <Button onClick={parseAndImport} disabled={files.length === 0 || isParsing}>
                        {isParsing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                        Import Shifts
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default React.memo(ShiftImport);
