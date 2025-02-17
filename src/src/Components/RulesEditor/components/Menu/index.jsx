import React, { Fragment, useContext, useEffect } from 'react';
import cls from './style.module.scss';
import { AppBar, ClickAwayListener, Tab, Tabs } from '@mui/material';

import I18n from '@iobroker/adapter-react-v5/i18n';

import CustomInput from '../CustomInput';
import CustomDragItem from '../CardMenu/CustomDragItem';
import HamburgerMenu from '../HamburgerMenu';
import { useStateLocal } from '../../hooks/useStateLocal';
import { ContextWrapperCreate } from '../ContextWrapper';
import MaterialDynamicIcon from '../../helpers/MaterialDynamicIcon';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { STEPS } from '../../helpers/Tour';

const Menu = ({ addClass, setAllBlocks, allBlocks, userRules, onChangeBlocks, setTourStep, tourStep, isTourOpen }) => {
    // eslint-disable-next-line no-unused-vars
    const { blocks, socket } = useContext(ContextWrapperCreate);
    const [hamburgerOnOff, setHamburgerOnOff] = useStateLocal(false, 'hamburgerOnOff');
    const [filter, setFilter] = useStateLocal({
        text: '',
        type: 'triggers',
        index: 0
    }, 'filterControlPanel');

    const handleChange = (event, newValue) => {
        isTourOpen && (newValue === 0 && tourStep === STEPS.selectTriggers) && setTourStep(STEPS.addScheduleByDoubleClick);
        isTourOpen && (newValue === 2 && tourStep === STEPS.selectActions) && setTourStep(STEPS.addActionPrintText);
        setFilter({
            ...filter,
            index: newValue,
            type: ['triggers', 'conditions', 'actions'][newValue]
        });
        setBlocksFunc(filter.text, ['triggers', 'conditions', 'actions'][newValue]);
    };

    const setBlocksFunc = (text = filter.text, typeFunc = filter.type) => {
        if (!blocks) {
            return;
        }
        let newAllBlocks = [...blocks];
        newAllBlocks = newAllBlocks.filter(el => {
            if (!text) {
                return true;
            }
            const { name } = el.getStaticData();
            return name && I18n.t(name).toLowerCase().includes(text.toLowerCase());
        });
        newAllBlocks = newAllBlocks.filter(el => typeFunc === el.getStaticData().acceptedBy);
        setAllBlocks(newAllBlocks);
    };

    const a11yProps = index => ({
        id: `scrollable-force-tab-${index}`,
        'aria-controls': `scrollable-force-tabpanel-${index}`
    });

    useEffect(() => {
        setBlocksFunc();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blocks]);
    return <ClickAwayListener
        mouseEvent={false}
        touchEvent="onTouchStart"
        onClickAway={() => setHamburgerOnOff(true)}
    >
        <div className={clsx(cls.menuWrapper, addClass[1035] && cls.addClassMenu)}>
            <div className={`${cls.hamburgerWrapper} ${hamburgerOnOff ? cls.hamburgerOff : null}`}
                onClick={() => setHamburgerOnOff(!hamburgerOnOff)}><HamburgerMenu boolean={!hamburgerOnOff} />
            </div>
            <div className={`${clsx(cls.menuRules, addClass[1035] && cls.addClassBackground, addClass[835] && cls.addClassPosition)} ${hamburgerOnOff ? cls.menuOff : null}`}>
                <div className={cls.controlPanel}>
                    <AppBar className={cls.controlPanelAppBar} position="static">
                        <Tabs
                            value={filter.index}
                            onChange={handleChange}
                        >
                            <Tab className="blocks-triggers"
                                title={I18n.t('Triggers')}
                                icon={<MaterialDynamicIcon iconName='FlashOn' />}
                                {...a11yProps(0)} />
                            <Tab title={I18n.t('Conditions')} className="blocks-conditions" icon={<MaterialDynamicIcon iconName='Help' />}
                                {...a11yProps(1)} />
                            <Tab title={I18n.t('Actions')} className="blocks-actions" icon={<MaterialDynamicIcon iconName='PlayForWork' />}
                                {...a11yProps(2)} />
                        </Tabs>
                    </AppBar>
                </div>
                <div className={cls.switchesRenderWrapper}>
                    <span>
                        {allBlocks.map(el => {
                            const { name, id, icon, adapter } = el.getStaticData();
                            return <Fragment key={id}>
                                <CustomDragItem
                                    onTouchMove={() => setHamburgerOnOff(true)}
                                    setTourStep={setTourStep}
                                    tourStep={tourStep}
                                    isTourOpen={isTourOpen}
                                    allProperties={el.getStaticData()}
                                    name={name}
                                    icon={icon}
                                    adapter={adapter}
                                    socket={socket}
                                    userRules={userRules}
                                    setUserRules={onChangeBlocks}
                                    isActive={false}
                                    id={id}
                                />
                            </Fragment>;
                        })}
                        {allBlocks.length === 0 && <div className={cls.nothingFound}>
                            {I18n.t('Nothing found')}...
                            <div className={cls.resetSearch} onClick={() => {
                                setFilter({
                                    ...filter,
                                    text: ''
                                });
                                setBlocksFunc('');
                            }}>{I18n.t('reset search')}</div>
                        </div>}
                    </span>
                </div>
                <div className={clsx(cls.menuTitle, cls.marginAuto)} />
                <CustomInput
                    className={cls.inputWidth}
                    fullWidth
                    customValue
                    value={filter.text}
                    size="small"
                    autoComplete="off"
                    label={I18n.t('search')}
                    variant="outlined"
                    onChange={(value) => {
                        setFilter({ ...filter, text: value });
                        setBlocksFunc(value);
                    }}
                />
            </div>
        </div>
    </ClickAwayListener>;
}

Menu.propTypes = {
    onChange: PropTypes.func,
    code: PropTypes.string
};

export default Menu;
