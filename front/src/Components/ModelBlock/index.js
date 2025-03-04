import React, { useState, useContext, useRef, useEffect } from 'react';
import PropType from 'prop-types';
import copy from '../../core/blocks/logic/copy';
import { WorkspaceContext } from '../../context';
import KeyDropdown from './KeyDropdown';
import SpriteDropdown from './SpriteDropdown';

const GroupModel = ({ block, scrollY }) => {
  const [position] = useState({ x: block.x, y: block.y });
  const { workspaceDispatch } = useContext(WorkspaceContext);
  const [, setRender] = useState();
  const gRef = useRef();
  useEffect(() => {
    // eslint-disable-next-line
    block.render = setRender;
    block.setNode(gRef.current);
  }, [block]);
  let inputIdx = -1;
  return (
    <g
      ref={gRef}
      key={block.id}
      onMouseEnter={copy({ workspaceDispatch, allIdx: block.allIdx, styleIdx: block.styleIdx })}
      transform={`translate(${position.x},${position.y - scrollY})`}
    >
      {block.path}
      {block.args.reduce((acc, cur) => {
        if (cur !== 'input' && cur !== 'dropdown') {
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
        acc.push(cur);
        return acc;
      }, [])}
    </g>
  );
};

GroupModel.propTypes = {
  block: PropType.object.isRequired,
  scrollY: PropType.number.isRequired,
};

export default GroupModel;
