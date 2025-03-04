import React, { useState, useContext, useRef, useEffect } from 'react';
import PropType from 'prop-types';
import drag from '../../core/blocks/logic/drag';
import { WorkspaceContext } from '../../context';
import CONSTANTS from '../../core/blocks/constants';
import Input from './Input';
import KeyDropdown from './KeyDropdown';
import SpriteDropdown from './SpriteDropdown';

const Block = ({ block }) => {
  const [position, setPosition] = useState({ x: block.x, y: block.y });
  if (block.previousElement && position.y !== block.previousElement.height - CONSTANTS.PIXEL) {
    setPosition({ x: 0, y: block.previousElement.height - CONSTANTS.PIXEL });
  }
  if (block.parentElement && position.y !== CONSTANTS.BLOCK_HEAD_HEIGHT) {
    setPosition({ x: CONSTANTS.PREVIOUS_NEXT_POS_X, y: CONSTANTS.BLOCK_HEAD_HEIGHT });
  }
  if (block.outputElement) {
    if ((block.outputElement.style === 'condition' || block.outputElement.style === 'variable') && position.y !== 0) {
      block.outputElement.inputElement.forEach((input, idx) => {
        if (block.outputElement.inputX[idx] && (input.id === block.id)) {
          setPosition({ x: block.outputElement.inputX[idx], y: 0 });
        }
      });
    } else if ((block.outputElement.style === 'single' || block.outputElement.style === 'double') && position.y !== CONSTANTS.PIXEL + 1) {
      block.outputElement.inputElement.forEach((input, idx) => {
        if (block.outputElement.inputX[idx] && (input.id === block.id)) {
          setPosition({ x: block.outputElement.inputX[idx], y: CONSTANTS.PIXEL + 1 });
        }
      });
    }
  }
  const { workspaceDispatch } = useContext(WorkspaceContext);
  const [, setRender] = useState();
  const gRef = useRef();
  let inputIdx = -1;
  useEffect(() => {
    // eslint-disable-next-line
    block.render = setRender;
    block.setNode(gRef.current);
  }, [block]);
  return (
    <g
      id={block.id}
      key={block.id}
      ref={gRef}
      onMouseDown={
          drag({ set: setPosition, block, workspaceDispatch })
      }
      transform={`translate(${position.x},${position.y})`}
    >
      {block.path}
      {block.args.reduce((acc, cur) => {
        if (cur !== 'input' && cur !== 'block' && cur !== 'dropdown') {
          acc.push(cur);
          return acc;
        }
        inputIdx += 1;
        if (cur === 'dropdown') {
          if (block.style === 'condition') {
            acc.push(<SpriteDropdown block={block} index={inputIdx} key={inputIdx} />);
          } else { acc.push(<KeyDropdown block={block} index={inputIdx} key={inputIdx} />); }
          return acc;
        }
        if (cur === 'block') {
          const inputBlock = block.workspace.getBlockById(block.inputElement[inputIdx].id);
          acc.push(<Block block={inputBlock} key={block.inputElement[inputIdx].id} />);
          return acc;
        }
        acc.push(<Input block={block} index={inputIdx} key={inputIdx} />);
        return acc;
      }, [])}
      {block.firstChildElement
      && <Block block={block.firstChildElement} key={block.firstChildElement.id} />}
      {block.secondChildElement
      && <Block block={block.secondChildElement} key={block.secondChildElement.id} />}
      {block.nextElement && <Block block={block.nextElement} key={block.nextElement.id} />}
    </g>
  );
};

Block.propTypes = {
  block: PropType.object.isRequired,
};

export default Block;
