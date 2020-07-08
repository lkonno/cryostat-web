import * as React from 'react';
import { ServiceContext } from '@app/Shared/Services/Services';
import { TargetView } from '@app/TargetView/TargetView';
import { Card, CardBody, CardHeader, Tab, Tabs, Text, TextVariants } from '@patternfly/react-core';
import { ActiveRecordingsList } from './ActiveRecordingsList';
import { ArchivedRecordingsList } from './ArchivedRecordingsList';

export const RecordingList = () => {
  const context = React.useContext(ServiceContext);
  const [activeTab, setActiveTab] = React.useState(0);
  const [archiveEnabled, setArchiveEnabled] = React.useState(false);

  React.useEffect(() => {
    const sub = context.commandChannel.isArchiveEnabled().subscribe(setArchiveEnabled);
    return () => sub.unsubscribe();
  }, [context.commandChannel]);

  const cardBody = React.useMemo(() => {
    return archiveEnabled ? (
      <Tabs activeKey={activeTab} onSelect={(evt, idx) => setActiveTab(Number(idx))}>
        <Tab eventKey={0} title="Active Recordings">
          <ActiveRecordingsList archiveEnabled={true}/>
        </Tab>
        <Tab eventKey={1} title="Archived Recordings">
          <ArchivedRecordingsList />
        </Tab>
      </Tabs>
    ) : (
      <>
        <CardHeader><Text component={TextVariants.h4}>Active Recordings</Text></CardHeader>
        <ActiveRecordingsList archiveEnabled={false}/>
      </>
    );
  }, [archiveEnabled, activeTab]);

  return (
    <TargetView pageTitle="Recordings">
      <Card>
        <CardBody>
          { cardBody }
        </CardBody>
      </Card>
    </TargetView>
  );
};