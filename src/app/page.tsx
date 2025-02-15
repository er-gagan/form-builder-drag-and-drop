"use client";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

// Define types for better type safety
type FieldType = "singleLine" | "multiLine" | "itemSelect" | "checkbox" | "radio" | "date";

interface Field {
  id: string;
  fieldName: string;
  fieldType: FieldType;
}

interface Row {
  id: string;
  rowData: Field[];
}

const App: React.FC = () => {
  const [formData, setFormData] = useState<Row[]>([]);
  const [fieldTypeSelect, setFieldTypeSelect] = useState<FieldType>("singleLine");
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [history, setHistory] = useState<Row[][]>([]);
  const [future, setFuture] = useState<Row[][]>([]);

  const saveHistory = () => {
    setHistory([...history, formData]);
    setFuture([]);
  };

  const undo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setFuture([formData, ...future]);
      setFormData(previousState);
      setHistory(history.slice(0, -1));
    }
  };

  const redo = () => {
    if (future.length > 0) {
      const nextState = future[0];
      setHistory([...history, formData]);
      setFormData(nextState);
      setFuture(future.slice(1));
    }
  };

  const saveForm = () => {
    localStorage.setItem("formData", JSON.stringify(formData));
    alert("Form saved successfully!");
  };

  const loadForm = () => {
    const savedFormData = JSON.parse(localStorage.getItem("formData") || "[]");
    if (savedFormData.length > 0) {
      setFormData(savedFormData);
      alert("Form loaded successfully!");
    } else {
      alert("No saved form found!");
    }
  };

  const togglePreview = () => {
    setIsPreview(!isPreview);
  };

  const handleDragStart = (fieldType: FieldType) => {
    setFieldTypeSelect(fieldType);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    saveHistory();
    const dropArea: any = e.target;
    const nestedParent = dropArea.closest('div[id]');

    const newField: Field = {
      id: uuidv4(),
      fieldName: "Field",
      fieldType: fieldTypeSelect,
    };

    if (nestedParent.id === "drop-area") {
      // Add a new row with the field
      const newRow = {
        id: uuidv4(),
        rowData: [newField],
      };
      setFormData([...formData, newRow]);
    } else {
      // Add the field to an existing row
      const updatedFormData = formData.map((row) => {
        if (row.id === nestedParent.id) {
          return {
            ...row,
            rowData: [...row.rowData, newField],
          };
        }
        return row;
      });
      setFormData(updatedFormData);
    }
  };

  const updateFieldName = (rowId: string, fieldId: string, newName: string) => {
    const updatedFormData = formData.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          rowData: row.rowData.map((field) =>
            field.id === fieldId ? { ...field, fieldName: newName } : field
          ),
        };
      }
      return row;
    });
    setFormData(updatedFormData);
  };

  const deleteField = (rowId: string, fieldId: string) => {
    const updatedFormData = formData.map((row) => {
      if (row.id === rowId) {
        return {
          ...row,
          rowData: row.rowData.filter((field) => field.id !== fieldId),
        };
      }
      return row;
    });
    setFormData(updatedFormData);
  };

  const deleteRow = (rowId: string) => {
    const updatedFormData = formData.filter((row) => row.id !== rowId);
    setFormData(updatedFormData);
  };

  const renderField = (field: Field, rowId: string, updateFieldName: (rowId: string, fieldId: string, newName: string) => void) => {
    return (
      <div key={field.id} className="flex-1">
        {isPreview === false && (

          <input
            type="text"
            value={field.fieldName}
            onChange={(e) => updateFieldName(rowId, field.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        )}
        {field.fieldType === "singleLine" && (
          <input
            type="text"
            placeholder="Single Line Input"
            className="w-full p-2 border border-gray-300 rounded"
          />
        )}
        {field.fieldType === "multiLine" && (
          <textarea
            placeholder="Multi Line Input"
            className="w-full p-2 border border-gray-300 rounded"
          />
        )}
        {field.fieldType === "itemSelect" && (
          <select className="w-full p-2 border border-gray-300 rounded">
            <option value="Option A">Option A</option>
            <option value="Option B">Option B</option>
            <option value="Option C">Option C</option>
          </select>
        )}
        {field.fieldType === "checkbox" && (
          <div className="flex items-center">
            <input type="checkbox" id={field.id} className="mr-2" />
            <label htmlFor={field.id}>Checkbox</label>
          </div>
        )}
        {field.fieldType === "radio" && (
          <div className="flex items-center">
            <input type="radio" id={field.id} name="radio-group" className="mr-2" />
            <label htmlFor={field.id}>Radio Option</label>
          </div>
        )}
        {field.fieldType === "date" && (
          <input type="date" className="w-full p-2 border border-gray-300 rounded" />
        )}
      </div>
    );
  };

  console.log("formData", formData)

  return (
    <div className="flex h-screen w-full bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Form Components</h3>
        {(["singleLine", "multiLine", "itemSelect", "checkbox", "radio", "date"] as FieldType[]).map((type) => (
          <button
            key={type}
            draggable
            onDragStart={() => handleDragStart(type)}
            className="w-full p-2 mb-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
          >
            {type.replace(/([A-Z])/g, " $1").trim()}
          </button>
        ))}
      </div>

      {/* Form Area */}
      <div
        id="drop-area"
        className="flex-1 p-4 bg-gray-50 overflow-y-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e)}
      >
        <div className="flex justify-between mb-4">
          <button
            onClick={togglePreview}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
          >
            {isPreview ? "Edit Form" : "Preview Form"}
          </button>
          <div>
            <button
              onClick={saveForm}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 mr-2"
            >
              Save Form
            </button>
            <button
              onClick={loadForm}
              className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition duration-200 mr-2"
            >
              Load Form
            </button>
            <button
              onClick={undo}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200 mr-2"
            >
              Undo
            </button>
            <button
              onClick={redo}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
            >
              Redo
            </button>
          </div>
        </div>

        {isPreview ? (
          formData.map((row) => (
            <div key={row.id} className="flex mb-4">
              {row.rowData.map((field) => (
                <div key={field.id} className="flex-1 m-2">
                  <label className="block text-sm font-medium text-gray-700">{field.fieldName}</label>
                  {renderField(field, row.id, updateFieldName)}
                </div>
              ))}
            </div>
          ))
        ) : (<>
          {formData.map((row) => (
            <div
              key={row?.id}
              id={row?.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e)}
              className="group relative bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex gap-4">
                {row?.rowData.map((field) => (
                  <div key={field?.id} className="flex items-center space-x-2 w-full">
                    {renderField(field, row?.id, updateFieldName)}
                    <button
                      onClick={() => deleteField(row?.id, field?.id)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      title="Delete Component"
                    >
                      ❌
                    </button>
                  </div>
                ))}
              </div>
              <abbr title="Delete Row">
                <button
                  onClick={() => deleteRow(row.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition duration-200 hidden group-hover:block"
                  title="Delete Row"
                >
                  ❌
                </button>
              </abbr>
            </div>
          ))}
        </>)}
      </div>
    </div>
  );
};

export default App;