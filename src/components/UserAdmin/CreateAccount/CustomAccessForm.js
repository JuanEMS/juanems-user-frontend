import React from 'react';
import { Card, Checkbox, Col, Row, Button, Divider } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { moduleIcons } from './icons';
import { defaultRoleModules } from './schema';

const CustomAccessForm = ({ role, selectedModules, setSelectedModules, hasCustomAccess }) => {
  const moduleGroups = defaultRoleModules[role] || {};

  const getAllModuleKeys = () =>
    Object.entries(moduleGroups).flatMap(([parent, subs]) => [parent, ...subs]);

  const handleParentToggle = (parent, submodules) => {
    const isChecked = selectedModules.includes(parent);
    const updated = new Set(selectedModules);

    if (isChecked) {
      updated.delete(parent);
      submodules.forEach((sub) => updated.delete(sub));
    } else {
      updated.add(parent);
      submodules.forEach((sub) => updated.add(sub));
    }

    setSelectedModules(Array.from(updated));
  };

  const handleSubToggle = (parent, submodules, changedSub) => {
    const updated = new Set(selectedModules);

    if (updated.has(changedSub)) {
      updated.delete(changedSub);
    } else {
      updated.add(changedSub);
    }

    const hasCheckedSubmodules = submodules.some((sub) => updated.has(sub));
    if (hasCheckedSubmodules) {
      updated.add(parent);
    } else {
      updated.delete(parent);
    }

    setSelectedModules(Array.from(updated));
  };

  const isParentIndeterminate = (parent, submodules) => {
    const hasSome = submodules.some((sub) => selectedModules.includes(sub));
    const hasAll = submodules.every((sub) => selectedModules.includes(sub));
    return hasSome && !hasAll;
  };

  if (!hasCustomAccess) return null;

  return (
    <div>
      <Row gutter={[16, 16]}>
        {Object.entries(moduleGroups).map(([parent, submodules]) => (
          <Col key={parent} xs={24} sm={12} md={12} lg={6}>
            <Card
              title={
                <span style={{ color: 'white' }}>
                  {moduleIcons[parent] || <SettingOutlined style={{ color: '#C68A00' }} />} {parent}
                </span>
              }
              headStyle={{ backgroundColor: '#00245A', borderBottom: '1px solid #001d4a' }}
              bodyStyle={{ paddingTop: 12 }}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                height: '100%',
              }}
            >
              <Checkbox
                indeterminate={isParentIndeterminate(parent, submodules)}
                checked={selectedModules.includes(parent)}
                onChange={() => handleParentToggle(parent, submodules)}
                style={{ marginBottom: submodules.length > 0 ? 8 : 0 }}
              >
                <strong>{parent}</strong>
              </Checkbox>

              {submodules.length > 0 && (
                <div style={{ paddingLeft: 24 }}>
                  {submodules.map((sub) => (
                    <div key={sub} style={{ marginBottom: 4 }}>
                      <Checkbox
                        checked={selectedModules.includes(sub)}
                        onChange={() => handleSubToggle(parent, submodules, sub)}
                      >
                        {sub}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />
      <div style={{ textAlign: 'right' }}>
        <Button onClick={() => setSelectedModules(getAllModuleKeys())} style={{ marginRight: 8 }}>
          Reset to Default
        </Button>
        <Button onClick={() => setSelectedModules([])}>
          Clear All
        </Button>
      </div>
    </div>
  );
};

export default CustomAccessForm;
