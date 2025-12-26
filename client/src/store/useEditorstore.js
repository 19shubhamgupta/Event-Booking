import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const useEditorStore = create((set, get) => ({
  currentPage: null,
  selectedBlockId: null,
  isLoading: false,
  isSaving: false,
  error: null,

  // Initialize a new empty page (for create mode)
  initNewPage: () => {
    set({
      currentPage: {
        title: "Untitled Page",
        blocks: [],
      },
      selectedBlockId: null,
      isLoading: false,
      error: null,
    });
  },

  // Create a new page in the database
  createPage: async (pageData) => {
    try {
      set({ isSaving: true });
      const res = await axiosInstance.post("/organize/page/create-page", {
        title: pageData.title || "Untitled Page",
        blocks: pageData.blocks || [],
      });

      if (res.data.success) {
        set({ currentPage: res.data.page });
        toast.success("Page created successfully!");
        return res.data.page;
      }
    } catch (err) {
      console.error("Create page error:", err);
      if (err.response) {
        toast.error(err.response.data?.message || "Failed to create page");
      } else {
        toast.error("Network error — please try again");
      }
      return null;
    } finally {
      set({ isSaving: false });
    }
  },

  setCurrentPage: (blocks) =>
    set((state) => ({
      currentPage: {
        ...state.currentPage,
        blocks,
      },
    })),

  // Set entire page (when loading from backend)
  getCurrentPage: async (pageId) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.get(`/organize/page/get-page/${pageId}`);
      set({
        currentPage: res.data,
      });
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data?.message || "Loading Page Failed");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ isLoading: false });
    }
  },

  // Update page title
  setPageTitle: (title) =>
    set((state) => ({
      currentPage: {
        ...state.currentPage,
        title,
      },
    })),

  // Add a new block
  addBlock: (block, index) =>
    set((state) => {
      if (!state.currentPage) return state;

      const newBlocks = [...state.currentPage.blocks];

      if (index !== undefined) {
        newBlocks.splice(index, 0, block);
      } else {
        newBlocks.push(block);
      }

      return {
        currentPage: {
          ...state.currentPage,
          blocks: newBlocks,
        },
        selectedBlockId: block.id,
      };
    }),

  // Add a block as a child to a parent block (for columns, hero, etc.)
  addBlockToParent: (parentBlockId, childBlock) =>
    set((state) => {
      if (!state.currentPage) return state;

      const updateBlockChildren = (blocks) => {
        return blocks.map((block) => {
          if (block.id === parentBlockId) {
            return {
              ...block,
              children: [...(block.children || []), childBlock],
            };
          }
          // Recursively check children
          if (block.children && block.children.length > 0) {
            return {
              ...block,
              children: updateBlockChildren(block.children),
            };
          }
          return block;
        });
      };

      return {
        currentPage: {
          ...state.currentPage,
          blocks: updateBlockChildren(state.currentPage.blocks),
        },
        selectedBlockId: childBlock.id,
      };
    }),

  // Update block properties
  updateBlock: (blockId, newProps) =>
    set((state) => {
      if (!state.currentPage) return state;

      const updateBlockRecursive = (blocks) => {
        return blocks.map((block) => {
          if (block.id === blockId) {
            return {
              ...block,
              props: {
                ...block.props,
                ...newProps,
              },
            };
          }
          // Recursively update children
          if (block.children && block.children.length > 0) {
            return {
              ...block,
              children: updateBlockRecursive(block.children),
            };
          }
          return block;
        });
      };

      return {
        currentPage: {
          ...state.currentPage,
          blocks: updateBlockRecursive(state.currentPage.blocks),
        },
      };
    }),

  // Delete a block
  deleteBlock: (blockId) =>
    set((state) => {
      if (!state.currentPage) return state;

      const deleteBlockRecursive = (blocks) => {
        return blocks
          .filter((block) => block.id !== blockId)
          .map((block) => {
            // Recursively delete from children
            if (block.children && block.children.length > 0) {
              return {
                ...block,
                children: deleteBlockRecursive(block.children),
              };
            }
            return block;
          });
      };

      return {
        currentPage: {
          ...state.currentPage,
          blocks: deleteBlockRecursive(state.currentPage.blocks),
        },
        selectedBlockId: null,
      };
    }),

  // Move block (for drag & drop)
  moveBlock: (blockId, newIndex) =>
    set((state) => {
      if (!state.currentPage) return state;

      const blocks = [...state.currentPage.blocks];
      const oldIndex = blocks.findIndex((b) => b.id === blockId);

      if (oldIndex === -1) return state;

      const [movedBlock] = blocks.splice(oldIndex, 1);
      blocks.splice(newIndex, 0, movedBlock);

      return {
        currentPage: {
          ...state.currentPage,
          blocks,
        },
      };
    }),

  saveToDb: async (currPage) => {
    try {
      set({ isSaving: true });

      const res = await axiosInstance.put(
        `/organize/page/update-page/${currPage._id}`,
        {
          title: currPage.title,
          blocks: currPage.blocks || [],
        }
      );
      console.log("save to db response : ", res.data);
      toast.success("Saved");
    } catch (err) {
      console.log(err);
      if (err.response) {
        toast.error(err.response.data?.message || "Unable to Save");
      } else {
        toast.error("Network error — please try again");
      }
    } finally {
      set({ isSaving: true });
    }
  },

  // Select a block
  selectBlock: (blockId) => set({ selectedBlockId: blockId }),

  // Deselect all blocks
  deselectBlock: () => set({ selectedBlockId: null }),

  // Set loading state
  setLoading: (isLoading) => set({ isLoading }),

  // Set saving state
  setSaving: (isSaving) => set({ isSaving }),

  // Set error
  setError: (error) => set({ error }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store (when leaving editor)
  reset: () =>
    set({
      currentPage: null,
      selectedBlockId: null,
      isLoading: false,
      isSaving: false,
      error: null,
    }),
}));

export default useEditorStore;
