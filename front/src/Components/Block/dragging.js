import ConnectionDB from './connection_db';
import workspaceList from './workspaceList';
import CONSTANTS from './constants';

const Dragging = class {
  constructor() {
    this.connectionDB = new ConnectionDB();
    this.isDragging = false;
    this.draggedBlock = null;
    this.availableConnection = null;
    this.x = 0;
    this.y = 0;
    this.closetConnection = null;
    this.localConnection = null;
    this.lastBlock = null;
    this.lastBlockDiff = null;
  }

  dragStart = (sourceBlock) => {
    this.isDragging = true;
    this.draggedBlock = sourceBlock;
    this.draggedBlock.disconnectBlock();
    this.availableConnection = sourceBlock.getAvailableConnection(true);
    this.lastBlock = this.availableConnection[this.availableConnection.length - 1].source;
    this.lastBlockDiff = { x: this.lastBlock.x - this.draggedBlock.x,
      y: this.lastBlock.y - this.draggedBlock.y };
    this.connectionDB.reset();
    this.connectionDB.setConnections(this.draggedBlock);
  };

  updateBlockPosition = () => {
    this.draggedBlock.x = this.x;
    this.draggedBlock.y = this.y;
    this.lastBlock.x = this.x + this.lastBlockDiff.x;
    this.lastBlock.y = this.y + this.lastBlockDiff.y;
  };

  updateDrag = (movedX, movedY) => {
    const maxRadius = 25;
    let bestRadius = maxRadius;
    this.x = movedX;
    this.y = movedY;
    this.updateBlockPosition();
    this.availableConnection.forEach((conn) => {
      const result = this.connectionDB.findClosetConnection(conn, bestRadius);
      if (result.connection && result.radius < bestRadius) {
        bestRadius = result.radius;
        this.closetConnection = result.connection;
        this.localConnection = conn;
      }
    });
    if (bestRadius === maxRadius) {
      this.closetConnection = null;
      this.localConnection = null;
    }
    if (this.closetConnection) {
      const diffX = this.closetConnection.source.style === 'variable' || this.closetConnection.source.style === 'condition'
        ? 3 : 2;
      const diffY = this.closetConnection.source.style === 'variable' || this.closetConnection.source.style === 'condition'
        ? 2 : 1;
      workspaceList.showInsertMarker(this.localConnection.source.style,
        this.closetConnection.source.x + this.closetConnection.diffX - CONSTANTS.PIXEL * diffX,
        this.closetConnection.source.y + this.closetConnection.diffY - CONSTANTS.PIXEL * diffY);
    } else {
      workspaceList.hideInsertMarker();
    }
  };

  reset = () => {
    this.isDragging = false;
    this.draggedBlock.setDrag(false);
    this.draggedBlock = null;
    this.availableConnection = null;
    this.x = 0;
    this.y = 0;
    this.closetConnection = null;
    this.localConnection = null;
    this.lastBlock = null;
    this.lastBlockDiff = null;
  };

  dragEnd = () => {
    const block = this.draggedBlock;
    if (this.closetConnection) {
      this.connectBlock();
    }
    this.reset();
    if (workspaceList.setInsertMarker) {
      workspaceList.hideInsertMarker();
    }
    return block;
  };

  connectBlock = () => {
    this.localConnection.connectBlock(this.closetConnection);
  };
};

export default Dragging;
