/*
 * Copyright The Cryostat Authors
 *
 * The Universal Permissive License (UPL), Version 1.0
 *
 * Subject to the condition set forth below, permission is hereby granted to any
 * person obtaining a copy of this software, associated documentation and/or data
 * (collectively the "Software"), free of charge and under any and all copyright
 * rights in the Software, and any and all patent rights owned or freely
 * licensable by each licensor hereunder covering either (i) the unmodified
 * Software as contributed to or provided by such licensor, or (ii) the Larger
 * Works (as defined below), to deal in both
 *
 * (a) the Software, and
 * (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if
 * one is included with the Software (each a "Larger Work" to which the Software
 * is contributed by such licensors),
 *
 * without restriction, including without limitation the rights to copy, create
 * derivative works of, display, perform, and distribute the Software and make,
 * use, sell, offer for sale, import, export, have made, and have sold the
 * Software and the Larger Work(s), and to sublicense the foregoing rights on
 * either these or other terms.
 *
 * This license is subject to the following condition:
 * The above copyright notice and either this complete permission notice or at
 * a minimum a reference to the UPL must be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import * as React from 'react';
import { Card, CardBody, EmptyState, EmptyStateIcon, Title } from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { SortByDirection, Table, TableBody, TableHeader, TableVariant, ICell, ISortBy, info, sortable } from '@patternfly/react-table';
import { ServiceContext } from '@app/Shared/Services/Services';
import { NotificationCategory } from '@app/Shared/Services/NotificationChannel.service';
import { useSubscriptions } from '@app/utils/useSubscriptions';
import { BreadcrumbPage } from '@app/BreadcrumbPage/BreadcrumbPage';
import { LoadingView } from '@app/LoadingView/LoadingView';

interface Rule {
  name: string;
  description: string;
  matchExpression: string;
  archivalPeriodSeconds: number;
  preservedArchives: number;
  maxAgeSeconds: number;
  maxSizeBytes: number;
}

export const Rules = () => {
  const context = React.useContext(ServiceContext);
  const addSubscription = useSubscriptions();

  const [isLoading, setIsLoading] = React.useState(false);
  const [sortBy, setSortBy] = React.useState({} as ISortBy);
  const [rules, setRules] = React.useState([] as Rule[]);

  const tableColumns = [
    {
      title: 'Name',
      transforms: [ sortable ],
    },
    { title: 'Description', },
    {
      title: 'Match Expression',
      transforms: [
        info({
          tooltip: 'A code-snippet expression which must evaluate to a boolean when applied to a given target. If the expression evaluates to true then the rule applies to that target.'
        })
      ],
    },
    {
      title: 'Archival Period',
      transforms: [
        info({
          tooltip: 'Period in seconds. Cryostat will connect to matching targets at this interval and copy the relevant recording data into its archives. Values less than 1 prevent data from being copied into archives - recordings will be started and remain only in target JVM memory.'
        })
      ],
    },
    {
      title: 'Preserved Archives',
      transforms: [
        info({
          tooltip: 'The number of recording copies to be maintained in the Cryostat archives. Cryostat will continue retrieving further archived copies and trimming the oldest copies from the archive to maintain this limit. Values less than 1 prevent data from being copied into archives - recordings will be started and remain only in target JVM memory.'
        })
      ],
    },
    {
      title: 'Maximum Age',
      transforms: [
        info({
          tooltip: 'The maximum age in seconds for data kept in the JFR recordings started by this rule. Values less than 1 indicate no limit.'
        })
      ],
    },
    {
      title: 'Maximum Size',
      transforms: [
        info({
          tooltip: 'The maximum size in bytes for JFR recordings started by this rule. Values less than 1 indicate no limit.'
        })
      ],
    },
  ] as ICell[];

  const refreshRules = React.useCallback(() => {
    setIsLoading(true);
    addSubscription(
      context.api.doGet('rules', 'v2').subscribe((v: any) => {
        setRules(v.data.result);
        setIsLoading(false);
      })
    );
  }, [setIsLoading, addSubscription, context, context.api, setRules]);

  React.useEffect(() => {
    refreshRules();
  }, [context, context.api]);

  React.useEffect(() => {
    addSubscription(
      context.notificationChannel.messages(NotificationCategory.RuleCreated)
        .subscribe(v => setRules(old => old.concat(v.message)))
    );
  }, [addSubscription, context, context.notificationChannel, setRules]);

  React.useEffect(() => {
    addSubscription(
      context.notificationChannel.messages(NotificationCategory.RuleDeleted)
        .subscribe(v => setRules(old => old.filter(o => o.name != v.message.name)))
    )
  }, [addSubscription, context, context.notificationChannel, setRules]);

  React.useEffect(() => {
    if (!context.settings.autoRefreshEnabled()) {
      return;
    }
    const id = window.setInterval(() => refreshRules(), context.settings.autoRefreshPeriod() * context.settings.autoRefreshUnits());
    return () => window.clearInterval(id);
  }, []);

  const handleSort = (event, index, direction) => {
    setSortBy({ index, direction });
  };

  const displayRules = React.useMemo(() => {
    const { index, direction } = sortBy;
    let sorted = [...rules];
    if (typeof index === 'number') {
      const keys = ['name'];
      const key = keys[index];
      sorted = rules
        .sort((a: Rule, b: Rule): number => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
      sorted = direction === SortByDirection.asc ? sorted : sorted.reverse();
    }
    return sorted.map((r: Rule) => ([ r.name, r.description, r.matchExpression, r.archivalPeriodSeconds, r.preservedArchives, r.maxAgeSeconds, r.maxSizeBytes ]));
  }, [rules, sortBy]);

  const viewContent = () => {
    if (rules.length === 0) {
      return (<>
        <EmptyState>
          <EmptyStateIcon icon={SearchIcon}/>
          <Title headingLevel="h4" size="lg">
            No Automated Rules
          </Title>
        </EmptyState>
      </>);
    } else if (isLoading) {
      return <LoadingView />;
    } else {
      return (<>
        <Table aria-label="Automated Rules table"
          variant={TableVariant.compact}
          cells={tableColumns}
          rows={displayRules}
          sortBy={sortBy}
          onSort={handleSort}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </>);
    }
  };

  return (<>
    <BreadcrumbPage pageTitle='Automated Rules' >
      <Card>
        <CardBody>
          {viewContent()}
        </CardBody>
      </Card>
    </BreadcrumbPage>
  </>);

};