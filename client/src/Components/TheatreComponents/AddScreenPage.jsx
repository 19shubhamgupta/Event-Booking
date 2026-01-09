import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  LayoutGrid,
  Plus,
  Trash2,
  Grid3x3,
  Info,
  Armchair,
  Save,
} from "lucide-react";
import { useTheatreStore } from "../../store/useTheatreStore";
import { useNavigate } from "react-router-dom";

const AddScreenPage = () => {
  const [rows, setRows] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [editingSeatId, setEditingSeatId] = useState(null);
  const [editingSeatName, setEditingSeatName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate()

  const { createScreen, theatre } = useTheatreStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      screenName: "",
    },
  });

  const watchedValues = watch();

  // Add a new row
  const addRow = () => {
    const newRow = {
      id: Date.now(),
      seats: [],
    };
    setRows([...rows, newRow]);
  };

  // Remove a row
  const removeRow = (rowId) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  // Add seats to a row
  const addSeatsToRow = (rowId, count) => {
    setRows(
      rows.map((row) => {
        if (row.id === rowId) {
          const currentSeats = row.seats.filter((s) => s.type !== "spacer");
          const startNumber = currentSeats.length + 1;
          const newSeats = Array.from({ length: count }, (_, i) => ({
            id: Date.now() + i,
            number: startNumber + i,
            name: `Seat ${startNumber + i}`,
            type: "regular",
            available: true,
          }));
          return { ...row, seats: [...row.seats, ...newSeats] };
        }
        return row;
      })
    );
  };

  // Add spacer/gap to a row
  const addSpacer = (rowId) => {
    setRows(
      rows.map((row) => {
        if (row.id === rowId) {
          const spacer = {
            id: Date.now(),
            type: "spacer",
            available: false,
          };
          return { ...row, seats: [...row.seats, spacer] };
        }
        return row;
      })
    );
  };

  // Remove seat from row
  const removeSeat = (rowId, seatId) => {
    setRows(
      rows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            seats: row.seats.filter((seat) => seat.id !== seatId),
          };
        }
        return row;
      })
    );
  };

  // Update seat type
  const updateSeatType = (rowId, seatId, type) => {
    setRows(
      rows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            seats: row.seats.map((seat) =>
              seat.id === seatId ? { ...seat, type } : seat
            ),
          };
        }
        return row;
      })
    );
  };

  // Update seat name
  const updateSeatName = (rowId, seatId, name) => {
    setRows(
      rows.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            seats: row.seats.map((seat) =>
              seat.id === seatId ? { ...seat, name } : seat
            ),
          };
        }
        return row;
      })
    );
  };

  // Start editing seat name
  const startEditingSeat = (rowId, seatId, currentName) => {
    setEditingSeatId(seatId);
    setEditingSeatName(currentName || "");
  };

  // Save seat name
  const saveSeatName = (rowId, seatId) => {
    if (editingSeatName.trim()) {
      updateSeatName(rowId, seatId, editingSeatName.trim());
    }
    setEditingSeatId(null);
    setEditingSeatName("");
  };

  // Calculate total capacity (exclude spacers)
  const calculateCapacity = () => {
    return rows.reduce((total, row) => {
      const actualSeats = row.seats.filter((seat) => seat.type !== "spacer");
      return total + actualSeats.length;
    }, 0);
  };

  // Handle form submission
  const onSubmit = async (data) => {
    // Flatten all seats into a single array with row and position info
    let seatCounter = 1;
    const allSeats = [];

    rows.forEach((row, rowIndex) => {
      row.seats.forEach((seat, positionIndex) => {
        if (seat.type === "spacer") {
          allSeats.push({
            seatName: `SPACER-${rowIndex}-${positionIndex}`,
            type: "spacer",
            available: false,
            row: rowIndex,
            position: positionIndex,
          });
        } else {
          allSeats.push({
            seatName: seat.name || `Seat ${seatCounter}`,
            type: seat.type,
            available: seat.available,
            row: rowIndex,
            position: positionIndex,
          });
          seatCounter++;
        }
      });
    });

    const screenData = {
      screenName: data.screenName,
      capacity: calculateCapacity(),
      seats: allSeats,
      theatreId: theatre._id,
    };

    console.log("Screen Data to Submit:", screenData);
    setCreating(true);
    await createScreen(screenData);
    navigate('/dashboard/manage-theatre')
    setCreating(false);
  };
  const getSeatColor = (type) => {
    switch (type) {
      case "premium":
        return "bg-yellow-400 hover:bg-yellow-500";
      case "vip":
        return "bg-purple-500 hover:bg-purple-600";
      case "spacer":
        return "bg-transparent";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return theatre ? (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 ">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6d27da] rounded-full mb-4">
            <LayoutGrid className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Add New Screen
          </h1>
          <p className="text-gray-600 text-lg">
            Configure screen details and seat layout
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Screen Details Card */}
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Grid3x3 className="w-6 h-6 mr-2 text-[#6d27da]" />
              Screen Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Screen Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Screen Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <Controller
                  name="screenName"
                  control={control}
                  rules={{
                    required: "Screen name is required",
                    minLength: {
                      value: 2,
                      message: "Screen name must be at least 2 characters",
                    },
                  }}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="e.g., Screen 1, Audi 1"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6d27da] transition-all ${
                        errors.screenName
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#6d27da]"
                      }`}
                    />
                  )}
                />
                {errors.screenName && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.screenName.message}
                  </p>
                )}
              </div>

              {/* Calculated Capacity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Capacity
                </label>
                <div className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-2xl font-bold text-[#6d27da]">
                    {calculateCapacity()}
                  </span>
                  <span className="text-gray-600 ml-2">seats</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Layout Builder Card */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Armchair className="w-6 h-6 mr-2 text-[#6d27da]" />
                Seat Layout
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {previewMode ? "Edit Mode" : "Preview Mode"}
                </button>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-2 px-4 py-2 bg-[#6d27da] text-white rounded-lg hover:bg-[#5a1fb8] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Row
                </button>
              </div>
            </div>

            {/* Seat Type Legend */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Seat Types:
              </h3>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-600">Regular</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-400 rounded"></div>
                  <span className="text-sm text-gray-600">Premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-600">VIP</span>
                </div>
              </div>
            </div>

            {/* Screen Indicator */}
            <div className="mb-6">
              <div className="w-full h-2 bg-gradient-to-b from-gray-400 to-gray-300 rounded-t-full"></div>
              <p className="text-center text-sm text-gray-500 mt-1">
                SCREEN THIS WAY
              </p>
            </div>

            {/* Rows */}
            <div className="space-y-2">
              {rows.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Armchair className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No rows added yet. Click "Add Row" to start.</p>
                </div>
              ) : (
                rows.map((row) => (
                  <div
                    key={row.id}
                    className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    {!previewMode ? (
                      <>
                        {/* Row Header - Edit Mode */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() => addSeatsToRow(row.id, 1)}
                            className="px-2 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                          >
                            + 1 Seat
                          </button>
                          <button
                            type="button"
                            onClick={() => addSeatsToRow(row.id, 5)}
                            className="px-2 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium"
                          >
                            + 5 Seats
                          </button>
                          <button
                            type="button"
                            onClick={() => addSeatsToRow(row.id, 10)}
                            className="px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                          >
                            + 10 Seats
                          </button>
                          <button
                            type="button"
                            onClick={() => addSpacer(row.id)}
                            className="px-2 py-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-xs font-medium"
                          >
                            + Gap
                          </button>
                          <button
                            type="button"
                            onClick={() => removeRow(row.id)}
                            className="ml-auto px-2 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Seats - Edit Mode */}
                        <div className="flex flex-wrap gap-1 items-center">
                          {row.seats.map((seat) => (
                            <div key={seat.id} className="relative group">
                              {seat.type === "spacer" ? (
                                <div className="relative">
                                  <div className="w-10 h-10 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs">
                                    ⌐
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeSeat(row.id, seat.id)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {editingSeatId === seat.id ? (
                                    <input
                                      type="text"
                                      value={editingSeatName}
                                      onChange={(e) =>
                                        setEditingSeatName(e.target.value)
                                      }
                                      onBlur={() =>
                                        saveSeatName(row.id, seat.id)
                                      }
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          saveSeatName(row.id, seat.id);
                                        }
                                      }}
                                      autoFocus
                                      className="w-10 h-10 text-center text-xs font-bold border-2 border-[#6d27da] rounded"
                                    />
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateSeatType(
                                          row.id,
                                          seat.id,
                                          seat.type === "regular"
                                            ? "premium"
                                            : seat.type === "premium"
                                            ? "vip"
                                            : "regular"
                                        )
                                      }
                                      onDoubleClick={() =>
                                        startEditingSeat(
                                          row.id,
                                          seat.id,
                                          seat.name
                                        )
                                      }
                                      className={`w-10 h-10 ${getSeatColor(
                                        seat.type
                                      )} text-white rounded text-xs font-bold transition-colors`}
                                    >
                                      {seat.name || seat.number}
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeSeat(row.id, seat.id)}
                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                                  >
                                    ×
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Preview Mode */}
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1 items-center flex-1">
                            {row.seats.map((seat) =>
                              seat.type === "spacer" ? (
                                <div key={seat.id} className="w-10 h-10"></div>
                              ) : (
                                <div
                                  key={seat.id}
                                  className={`w-10 h-10 ${getSeatColor(
                                    seat.type
                                  )} text-white rounded text-xs font-bold flex items-center justify-center cursor-default`}
                                >
                                  {seat.name || seat.number}
                                </div>
                              )
                            )}
                          </div>
                          <span className="text-xs text-gray-500 w-16 text-right">
                            {
                              row.seats.filter((s) => s.type !== "spacer")
                                .length
                            }{" "}
                            seats
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Info Section */}
            {!previewMode && rows.length > 0 && (
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Tips:</p>
                    <ul className="space-y-1 ml-4">
                      <li>
                        • Click on a seat to cycle through types (Regular →
                        Premium → VIP)
                      </li>
                      <li>• Double-click on a seat to edit its name</li>
                      <li>• Hover over any seat or gap to remove it</li>
                      <li>
                        • Use "+ Gap" to create aisles or spacing between
                        sections
                      </li>
                      <li>
                        • Add seats and gaps in the order they appear in your
                        theatre
                      </li>
                      <li>• Switch to Preview Mode to see the final layout</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !watchedValues.screenName || rows.length === 0 || creating
              }
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center gap-2 ${
                watchedValues.screenName && rows.length > 0
                  ? "bg-[#6d27da] hover:bg-[#5a1fb8] shadow-lg hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <Save className="w-5 h-5" />
              Save Screen
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <>
      <h1 className="pt-20">Create theatre first!!</h1>
    </>
  );
};

export default AddScreenPage;
